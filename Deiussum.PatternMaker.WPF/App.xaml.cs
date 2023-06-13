using System.Configuration;
using System.Data;
using System.Windows;

namespace Deiussum.PatternMaker.WPF;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application {

    protected override void OnStartup(StartupEventArgs ea) {
        base.OnStartup(ea);

        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

}

