using System;
using System.Net;
using System.Threading.Tasks;
using Dapper;
using Hangfire;
using Hangfire.MemoryStorage;
using Joy.PIM.BAL;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations;
using Joy.PIM.BAL.Implementations.B2C;
using Joy.PIM.BAL.Implementations.Storage;
using Joy.PIM.Common;
using Joy.PIM.Common.Cache;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.Common.PostgresTypes;
using Joy.PIM.CommonWeb;
using Joy.PIM.WorkFlow.Repository;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Storage.Net.Blobs;

namespace Joy.PIM.Api
{
    public class Startup
    {
        private string swaggerVersion =
            $"Build - {System.IO.File.GetLastWriteTime(System.Reflection.Assembly.GetExecutingAssembly().Location):MM.dd.yyyy.HH.mm}";

        private IServiceCollection _services;

        public Startup(IConfiguration configuration, IHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; set; }

        public IHostEnvironment Environment { get; set; }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseHsts();

            app.UseCookiePolicy(new CookiePolicyOptions
            {
                Secure = CookieSecurePolicy.None
            });
            app.UseAuthentication();
            app.UseResponseCaching();

            app.UseResponseCompression();
            app.UseSwagger();
            app.UseSwaggerUI(c => { c.SwaggerEndpoint("v1/swagger.json", $"HC.PIM API V1 {swaggerVersion}"); });
            app.UseCors(option =>
                option.SetIsOriginAllowed((host) => true).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseHangfireDashboard("/process");

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
         }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();

            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Events.OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        return Task.CompletedTask;
                    };
                });

            services.AddMemoryCache();
            services.AddHangfire(config => config
                    .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                    .UseMemoryStorage());
            services.AddHangfireServer();
            services.AddAuthorizationPolicies();
            services.AddSingleton<IJsonSerializer>(s => new NewtonSoftJsonSerializer(Formatting.None,
                new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                }));
            Dapper.SimpleCRUD.SetDialect(SimpleCRUD.Dialect.PostgreSQL);
            SimpleCRUD.SetTableNameResolver(new PostgresLowerCaseTableNameResolver());
            SimpleCRUD.SetColumnNameResolver(new PostgresLowerCaseColumnNameResolver());
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddDataProtection()
                .SetApplicationName("HC.PIM");
            services.AddHttpClient();
            services.AddTransient<IAuthenticationProvider, B2CAuthenticationProvider>();
            services.AddTransient<IAuthorizationHandler, HasRoleAuthorizationHandler>();
            services.AddTransient<IDistributedCache, InMemoryCacheHandler>();
            services.AddTransient<ICacheHandler, InMemoryCacheHandler>();
            services.AddTransient<IDbConnectionFactory>(s => new NpgSqlConnectionFactory(Configuration));
            services.AddTransient<IDbCache, PgDbCache>();
            services.AddTransient<IMasterManager, PgMasterManager>();
            services.AddTransient<IUserContext, HttpUserContext>();
            services.AddTransient<ICipherService, CipherService>();
            services.AddTransient<IMailEngine, SmtpMailEngine>();
            services.AddTransient<IUserManager, PgUserManager>();
            services.AddTransient<IBlobStorage>(s =>
                new PostgreSqlBlobStorage(Configuration.GetConnectionString("FileDB")));
            services.AddTransient<ILabelManager, PgLabelManager>();
            services.AddTransient<IWorkFlowManager, TaskstepInstanceRepo>();
            services.AddTransient<IWorkFlowManager1, WorkFlowInstanceRepo>();
            services.AddTransient<IStorageFactory>(s =>
            {
                var factory = new DefaultStorageFactory();
                factory.AddStorage("pgsql",
                    () => new PostgreSqlBlobStorage(Configuration.GetConnectionString("FileDB")));
                return factory;
            });

            services.AddMailService(Configuration);
            services.AddMvc(options =>
            {
                options.Filters.Add(typeof(ValidateModelStateAttribute));
                options.Filters.Add(typeof(ApiResponseFilter));
                options.Filters.Add(typeof(HandledExceptionFilter));
            });
            services.AddCors();
            services.AddResponseCompression();
            services.AddResponseCaching();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1",
                    new OpenApiInfo
                    { Title = "HC.PIM API", Version = $"HC.PIM API V1 {swaggerVersion}" });
                c.AddSecurityDefinition("Bearer",
                    new OpenApiSecurityScheme
                    {
                        In = ParameterLocation.Header,
                        Description = "Please insert ApiKey into field",
                        Name = "token",
                        Type = SecuritySchemeType.ApiKey
                    });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        new string[] { }
                    }
                });

                c.OperationFilter<EntityOperationFilter>();
                c.OperationFilter<FileUploadOperation>();
                c.SchemaFilter<EntitySchemaFilter>();
            });

            this._services = services;
        }
    }
}