
using System.Windows;

namespace Deiussum.PatternMaker.WPF;

/// <summary>
/// Interaction logic for WrittenPatternDialog.xaml
/// </summary>
public partial class WrittenPatternDialog : Window {
    public string Instructions { get; private set; }

    public WrittenPatternDialog(string instructions) {
        InitializeComponent();

        Instructions = instructions;
        WrittenPatternText.Text = Instructions;

    }

    private void OnCloseButtonClick(object sender, RoutedEventArgs ea) {
        DialogResult = true;
        Close();
    }
}