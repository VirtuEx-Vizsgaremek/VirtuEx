using System.Drawing;
using System.Windows.Controls;
using Microsoft.Web.WebView2.Core;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Pages;

public partial class WebPage : Page {
    private readonly ApiClient _api;
    
    public WebPage(ApiClient api) {
        _api = api;
        
        InitializeComponent();
        
        WebView.DefaultBackgroundColor =  Color.Transparent;

        LoadWebview();
    }

    async void LoadWebview() {
        await WebView.EnsureCoreWebView2Async(null);
        
        var cookie = WebView.CoreWebView2.CookieManager.CreateCookie("vtx_token", _api.Token, "localhost", "/");
        cookie.Expires  = DateTimeOffset.Now.AddMonths(1).DateTime;
        cookie.SameSite = CoreWebView2CookieSameSiteKind.Lax;
        cookie.IsSecure = false;
            
        WebView.CoreWebView2.CookieManager.AddOrUpdateCookie(cookie);
    }
}