using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Net.Http;
using System.Threading.Tasks;
using Joy.PIM.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Joy.PIM.BAL.Implementations
{
    [ExcludeFromCodeCoverage]
    public class RbacApiHttpClient : HttpClient
    {
        private readonly IConfiguration configuration;
        private readonly ICacheHandler cacheHandler;
        private readonly IUserContext userContext;

        public RbacApiHttpClient(IConfiguration configuration, ICacheHandler cacheHandler, IUserContext userContext)
        {
            this.configuration = configuration;
            this.cacheHandler = cacheHandler;
            this.userContext = userContext;
        }

        public async Task Execute<TRequest>(string method, string path, TRequest requestObject)
        {
            using var httpClient = new HttpClient();
            using var request = new HttpRequestMessage(new HttpMethod(method), $"{configuration["OlamNet:BaseUrl"]}{path}");
            request.Headers.TryAddWithoutValidation("accept", "application/json");

            // request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {await this.GetCachedToken()}");
            request.Content = new StringContent(JsonConvert.SerializeObject(requestObject));
            await httpClient.SendAsync(request);
        }

        public async Task<TResponse> GetResponse<TResponse>(string method, string path)
        {
            using var httpClient = new HttpClient();
            using var request = new HttpRequestMessage(new HttpMethod(method), $"{configuration["Rbac:BaseUrl"]}{path}");
            request.Headers.TryAddWithoutValidation("accept", "application/json");

            // request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {await this.GetCachedToken()}");
            var response = await httpClient.SendAsync(request);
            return await GetResponse<TResponse>(response);
        }

        public async Task<TResponse> GetResponse<TRequest, TResponse>(string method, string path, List<TRequest> requestObject)
        {
            using var httpClient = new HttpClient();
            using var request = new HttpRequestMessage(new HttpMethod(method), $"{configuration["Rbac:BaseUrl"]}{path}");
            request.Headers.TryAddWithoutValidation("accept", "application/json");

            // request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {await this.GetCachedToken()}");
            var jsonContent = JsonConvert.SerializeObject(requestObject);
            request.Content = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");
            var response = await httpClient.SendAsync(request);
            return await GetResponse<TResponse>(response);
        }

        private static async Task<T> GetResponse<T>(HttpResponseMessage response)
        {
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(result);
        }
    }
}
