using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection.Metadata;
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
using Joy.PIM.Migrator;
using Joy.PIM.WorkFlow.Repository;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using RbacDashboard;

// using Npgsql.Logging;
using Serilog;
using Serilog.Events;
using Storage.Net.Blobs;

namespace ESGRC.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // load configuration file and prereq settings
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var jsonPath = $"appsettings.Api.{env}.json";
            var swaggerVersion =
                $"Build - {File.GetLastWriteTime(System.Reflection.Assembly.GetExecutingAssembly().Location):MM.dd.yyyy.HH.mm}";
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
            AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

            // if (env.IsDevOrQa())
            // {
            //    NpgsqlLogManager.Provider = new ConsoleLoggingProvider(NpgsqlLogLevel.Debug);
            //    NpgsqlLogManager.IsParameterLoggingEnabled = true;
            // }            
            SqlMapper.AddTypeHandler(new DictionaryObjectValueHandler());
            SqlMapper.AddTypeHandler(new DictionaryListOfStringValueHandler());
            
            SimpleCRUD.SetDialect(SimpleCRUD.Dialect.PostgreSQL);
            SimpleCRUD.SetTableNameResolver(new PostgresLowerCaseTableNameResolver());
            SimpleCRUD.SetColumnNameResolver(new PostgresLowerCaseColumnNameResolver());
            var clientId = Environment.GetEnvironmentVariable("AZ_CLIENTID");
            var clientSecret = Environment.GetEnvironmentVariable("AZ_SECRET");
            Console.WriteLine(clientId);
            Console.WriteLine(clientSecret);

            var builder = WebApplication.CreateBuilder(args);

            var services = builder.Services;

            builder.Configuration.AddJsonFile(jsonPath, optional: false, reloadOnChange: true);

            var configuration = builder.Configuration;
            builder.Configuration.AddEnvironmentVariables();
            if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            {
                configuration.AddAzureKeyVault(
                    $"https://{configuration["Azure:KeyVaultName"]}.vault.azure.net/");
            }
            else
            {
                configuration.AddAzureKeyVault(
                    $"https://{configuration["Azure:KeyVaultName"]}.vault.azure.net/", clientId, clientSecret);
            }

            var instrumentationKey = configuration["Azure:ApplicationInsights:InstrumentationKey"];
            if (!string.IsNullOrWhiteSpace(
                    Environment.GetEnvironmentVariable("APPINSIGHTS_INSTRUMENTATIONKEY")))
            {
                instrumentationKey = Environment.GetEnvironmentVariable("APPINSIGHTS_INSTRUMENTATIONKEY");
            }

            builder.Configuration["RbacSettings:DbConnectionString"] = configuration["ConnectionString"];

            services.AddAuthorization(options => { options.AddRbacPolicy(); });
            services.AddRbacService(builder.Configuration, builder.Environment);

            var telemetryConfiguration = TelemetryConfiguration.CreateDefault();
            telemetryConfiguration.InstrumentationKey = instrumentationKey;

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo
                .ApplicationInsights(telemetryConfiguration, TelemetryConverter.Traces)
                .CreateLogger();
            builder.Host.UseSerilog();
            builder.Services.AddControllersWithViews();
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
                    ContractResolver = new CamelCasePropertyNamesContractResolver(),
                    MissingMemberHandling = MissingMemberHandling.Ignore,
                    NullValueHandling = NullValueHandling.Ignore
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
            var blob = configuration["UseFileShare"];

            // if (blob.ToLower() == "false")
            // {
            //    services.AddTransient<IBlobRepo, FileShareRepo>();
            // }
            // else
            // {
            //    services.AddTransient<IBlobRepo, BlobRepo>();
            // }
            services.AddTransient<IBlobRepo, BlobRepo>();

            services.AddTransient<IDistributedCache, InMemoryCacheHandler>();
            services.AddTransient<ICacheHandler, InMemoryCacheHandler>();
            services.AddTransient<IDbConnectionFactory>(s => new NpgSqlConnectionFactory(configuration));
            services.AddTransient<IDbCache, PgDbCache>();
            services.AddTransient<IMasterManager, PgMasterManager>();
            services.AddTransient<IUserContext, HttpUserContext>();
            services.AddTransient<ICipherService, CipherService>();
            services.AddTransient<IMailEngine, SmtpMailEngine>();
            services.AddTransient<IUserManager, PgUserManager>();
            services.AddTransient<IRbacApiClient, RbacApiClient>();
            services.AddTransient<IBlobStorage>(s =>
                new PostgreSqlBlobStorage(configuration.GetConnectionString("FileDB")));
            services.AddTransient<ILabelManager, PgLabelManager>();
            services.AddTransient<IWorkFlowManager, TaskstepInstanceRepo>();
            services.AddTransient<IWorkFlowManager1, WorkFlowInstanceRepo>();
            services.AddTransient<IMetricRepo, MetricRepository>();
            services.AddTransient<IMetricGroup, MetricGroupRepo>();
            services.AddTransient<ITemplates, TemplateRepo>();
            services.AddTransient<ICities, CitiesRepo>();
            services.AddTransient<IAssessment, AssessmentRepository>();
            services.AddTransient<IProcessManager, ProcessManager>();
            services.AddTransient<ICompliance, ComplianceRepo>();
            services.AddTransient<IuploadFileManager, UploadFileManager>();
            services.AddTransient<IAuditRepo, AuditRepo>();
            services.AddTransient<IDataProcess, Dataprocess>();
            services.AddTransient<IStubApi, PgStubApiManager>();
            services.AddTransient<IIntegrationManager, IntegrationManager>();

            services.AddTransient<IPdfReportManager, PdfReportManager>();
            services.AddTransient<IPdfMerger, PdfMerger>();
            services.AddTransient<ITimeDimension, TimeDimensionRepo>();
            services.AddTransient<IXmlFileDownload, XmlFileDownloadRepo>();
            services.AddTransient<IMasterData, MasterDataRepo>();

            services.AddTransient<IStorageFactory>(s =>
            {
                var factory = new DefaultStorageFactory();
                factory.AddStorage("pgsql",
                    () => new PostgreSqlBlobStorage(configuration["ConnectionString"]));
                return factory;
            });

            services.AddMailService(configuration);
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
                        {Title = "HC.PIM Processor", Version = $"HC.PIM Processor V1 {swaggerVersion}"});
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
                            Reference = new OpenApiReference {Type = ReferenceType.SecurityScheme, Id = "Bearer"}
                        },
                        new string[] { }
                    }
                }); 
                c.SwaggerDoc("rbac", new OpenApiInfo { Title = "RBAC API", Version = "v1" });
                c.DocInclusionPredicate((docName, api) =>
                {
                    if (docName == "rbac" && api.GroupName == "Rbac" && api.RelativePath.Contains("GenerateCustomerToken"))
                    {
                        return true;
                    }

                    if (docName == "v1" && (api.GroupName == null || api.GroupName == "v1"))
                    {
                        return true;
                    }

                    return false;
                });

                c.OperationFilter<EntityOperationFilter>();
                c.OperationFilter<FileUploadOperation>();
                c.SchemaFilter<EntitySchemaFilter>();
            });

            var app = builder.Build();

            app.UseHsts();

            app.UseRbac("/RbacDashboard");

            app.UseCookiePolicy(new CookiePolicyOptions
            {
                Secure = CookieSecurePolicy.None
            });
            app.UseAuthentication();
            app.UseResponseCaching();

            app.UseResponseCompression();
            app.UseSwagger();
            app.UseSwaggerUI(c => 
            { 
                c.SwaggerEndpoint("v1/swagger.json", $"HC.PIM Processor V1 {swaggerVersion}");
                c.SwaggerEndpoint("/swagger/rbac/swagger.json", "RBAC API V1");
            });
            app.UseCors(option =>
                option.SetIsOriginAllowed((host) => true).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");
            app.UseHangfireDashboard("/process", new DashboardOptions
            {
                Authorization = new[] { new MyAuthorizationFilter() }
            });

            var assessment = services.BuildServiceProvider().GetRequiredService<IProcessManager>();
            RecurringJob.AddOrUpdate("assessmentstatus",
                () => assessment.UpdateAssesmentGroupStatus(), "30 12 * * *");

            var issueWarning = services.BuildServiceProvider().GetRequiredService<IProcessManager>();
            RecurringJob.AddOrUpdate("IssueStatus",
                () => assessment.IssueWarning(), "30 12 * * *");

            // var metricCalculation = services.BuildServiceProvider().GetRequiredService<IStubApi>();
            // RecurringJob.AddOrUpdate("MetricCalculation",
            //    () => metricCalculation.DataIngestion(), "0 * * * *", TimeZoneInfo.FindSystemTimeZoneById("India Standard Time"));
            app.Run();
        }
    }
}