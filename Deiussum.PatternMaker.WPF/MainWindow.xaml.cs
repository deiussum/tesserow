using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Deiussum.PatternMaker.Lib.Mosaic;

namespace Deiussum.PatternMaker.WPF;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window {
    public Chart MosaicChart { get; set; } 

    public MainWindow() {
        InitializeComponent();

        MosaicChart = new Chart(10, 10);
        MosaicChartItems.ItemsSource = MosaicChart.Rows;
        List<Tuple<int, string>> rowData = new List<Tuple<int, string>>();

        rowData.Add(new Tuple<int, string>(46, string.Empty));
        var columnList = Enumerable.Range(1, MosaicChart.ColumnCount).Reverse().ToList();
        rowData.AddRange(columnList.Select(x => new Tuple<int, string>(30, x.ToString())));
        rowData.Add(new Tuple<int, string>(46, string.Empty));

        TopRow.ItemsSource = rowData;
        BottomRow.ItemsSource = rowData;
    }

    private void ExitApp(object sender, RoutedEventArgs ea) {
        Application.Current.Shutdown();
    }

    private void MosaicSquareClicked(object sender, RoutedEventArgs ea) {
        var button = sender as Button;
        if (button == null) return;

        var rect = button.FindName("MosaicChartRectangle") as Border;
        if (rect == null) return;

        var chartSquare = rect.DataContext as ChartRowItem;
        if (chartSquare == null) return;

        chartSquare.ToggleColor();

        MosaicChartItems.Items.Refresh();
    }
}