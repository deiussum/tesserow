
using Deiussum.PatternMaker.Lib.Mosaic;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Deiussum.PatternMaker.WPF.Pdf;

public class WrittenInstructionComponent : IComponent {
    private readonly ChartPageModel _chart;

    public WrittenInstructionComponent(ChartPageModel chart) {
        _chart = chart;
    }

    public void Compose(IContainer container) {
        var writtenPattern = _chart.GetWrittenPattern();
        container.Text(writtenPattern);
        
    }
}