using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Deiussum.PatternMaker.WPF.Pdf;

public class ChartDocument : IDocument
{
    private readonly ChartPageModel _chart;

    public ChartDocument(ChartPageModel chart) {
        _chart = chart;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;
    public DocumentSettings GetSettings() => DocumentSettings.Default;

    public void Compose(IDocumentContainer container) {
        container.Page(page => {
            page.Margin(50);
            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().Element(ComposeFooter);

        });
    }

    private void ComposeHeader(IContainer container) {
        container.Row(row => {
            row.RelativeItem().Column(col => {
                col.Item().Text("Test title");
            });
        });

    }

    private void ComposeContent(IContainer container) {
        container.Column(col => {
            col.Item().Component(new ChartPageComponent(_chart));
            col.Item().Component(new WrittenInstructionComponent(_chart));
        });
    }

    private void ComposeFooter(IContainer container) {
        container.AlignCenter().Text(x => {
            x.CurrentPageNumber();
            x.Span(" / ");
            x.TotalPages();
        });
    }
}