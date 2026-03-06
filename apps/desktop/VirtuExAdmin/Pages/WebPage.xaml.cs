using System.Drawing;
using System.Windows.Controls;
using Microsoft.Web.WebView2.Core;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Pages;

public partial class WebPage : Page {
    public WebPage() {
        InitializeComponent();
        
        WebView.DefaultBackgroundColor =  Color.Transparent;
        
        /*
        WebView.Initialized += (sender, args) => {
            // Authenticate the user automagically.
            var cookie = WebView.CoreWebView2.CookieManager.CreateCookie("vtx_token", ApiClient.Instance.Token, "legany.hu", "/");
            cookie.IsHttpOnly = false;
            cookie.IsSecure   = true;
            WebView.CoreWebView2.CookieManager.AddOrUpdateCookie(cookie);
        };
        */
    }
}