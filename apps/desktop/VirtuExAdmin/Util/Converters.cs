using System.Globalization;
using System.Windows;
using System.Windows.Data;
using Newtonsoft.Json;

namespace VirtuExAdmin.Util;

public class BoolToVisibilityConverter : IValueConverter {
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture) {
        var invert    = parameter is string s && s == "Inverse";
        var boolValue = value is true;
        return (boolValue ^ invert) ? Visibility.Visible : Visibility.Collapsed;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => value is Visibility.Visible;
}

public class NullToVisibilityConverter : IValueConverter {
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture) {
        var invert = parameter is string s && s == "Inverse";
        var isNull = value is null;
        return (isNull ^ invert) ? Visibility.Collapsed : Visibility.Visible;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => Binding.DoNothing;
}

public class UnixMillisConverter : JsonConverter<DateTime> {
    public override DateTime ReadJson(JsonReader reader, Type objectType, DateTime existingValue, bool hasExistingValue, JsonSerializer serializer)
        => DateTimeOffset.FromUnixTimeMilliseconds((long)reader.Value!).UtcDateTime;

    public override void WriteJson(JsonWriter writer, DateTime value, JsonSerializer serializer)
        => writer.WriteValue(new DateTimeOffset(value).ToUnixTimeMilliseconds());
}