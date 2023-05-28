using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace Deiussum.PatternMaker.WPF;

public class IntegerToBrushConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        var colorNumber = value as int?;
        if (!colorNumber.HasValue) return Brushes.White;

        return colorNumber == 0 ? Brushes.Aqua : Brushes.White;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    {
        var brush = value as Brush;
        if (brush == null) return 0;

        return brush == Brushes.White ? 1 : 0;
    }
}