using System.Drawing;
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
using Deiussum.PatternMaker.WPF.Pdf;
using Microsoft.Win32;
using QuestPDF.Fluent;

namespace Deiussum.PatternMaker.WPF;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window {
    public Chart MosaicChart { get; set; } 

    public MainWindow() {
        InitializeComponent();

        MosaicChart = new Chart(10, 10);
        BindNewMosaic();
    }

    private void ExitApp(object sender, RoutedEventArgs ea) {
        Application.Current.Shutdown();
    }

    private void ImportImage(object sender, RoutedEventArgs ea) {
        var dialog = new OpenFileDialog();
        var result = dialog.ShowDialog();

        if (result != true) return;
        
        var image = new Bitmap(System.Drawing.Image.FromFile(dialog.FileName));

        MosaicChart = new Chart(image.Height, image.Width);

        for(var rowIndex = image.Height; rowIndex > 0; rowIndex--) {
            for(var colIndex = image.Width; colIndex > 0; colIndex--) {
                var pixel = image.GetPixel(colIndex - 1, rowIndex - 1);

                var convertedRow = image.Height - rowIndex + 1;
                var convertedColumn = image.Width - colIndex + 1;
                var color = IsWhite(pixel) ? 0 : 1;

                MosaicChart.SetColor(convertedColumn, convertedRow, color);
            }
        }
        BindNewMosaic();
    }

    private bool IsWhite(System.Drawing.Color color) {
        return color.A < 50 ||
            (color.R > 240 && color.G > 240 && color.B > 240);
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

    private void BindNewMosaic() {
        MosaicChartItems.ItemsSource = MosaicChart.Rows;
        var rowData = new List<Tuple<int, string>>();

        rowData.Add(new Tuple<int, string>(46, string.Empty));

        var columnList = Enumerable.Range(1, MosaicChart.ColumnCount).Reverse().ToList();
        rowData.AddRange(columnList.Select(x => new Tuple<int, string>(30, x.ToString())));
        rowData.Add(new Tuple<int, string>(46, string.Empty));

        TopRow.ItemsSource = rowData;
        BottomRow.ItemsSource = rowData;
    }

    private void ShowWrittenPattern(object sender, RoutedEventArgs ea) {
        var writtenPattern = MosaicChart.GetWrittenPattern();
        var dialog = new WrittenPatternDialog(writtenPattern);

        dialog.ShowDialog();
    }

    private void ExportPdf(object sender, RoutedEventArgs ea) {
        var dialog = new SaveFileDialog();
        dialog.DefaultExt = "pdf";

        if (dialog.ShowDialog() != true) return;

        var model = new ChartPageModel(MosaicChart);
        var doc = new ChartDocument(model);
        doc.GeneratePdf(dialog.FileName);

        MessageBox.Show("PDF exported!");
    }
}