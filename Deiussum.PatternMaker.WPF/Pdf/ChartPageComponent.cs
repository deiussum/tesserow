
using Deiussum.PatternMaker.Lib.Mosaic;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Deiussum.PatternMaker.WPF.Pdf;

public class ChartPageComponent : IComponent {
    private readonly ChartPageModel _chart;
    private const string colorA = Colors.White;
    private const string colorB = Colors.Grey.Lighten1;
    private const uint FontSize = 6;

    public ChartPageComponent(ChartPageModel chart) {
        _chart = chart;
    }

    public void Compose(IContainer container) {
        var pages = _chart.GetPagedChartItems(25, 70);

        container.Column(col => {
            foreach(var page in pages) {
                ComposePage(col.Item(), page);
                col.Item().PageBreak();
            }
        });

    }

    private void ComposePage(IContainer container, List<ChartRowItem> items) {

        var startRow = items.Min(x => x.RowNumber);
        var endRow = items.Max(x => x.RowNumber);
        var rowCount = endRow - startRow + 1;
        var startCol = items.Min(x => x.ColumnNumber);
        var endCol = items.Max(x => x.ColumnNumber);
        var colCount = endCol - startCol + 1;

        container.Table(table => {
            table.ColumnsDefinition(columns => {
                for(var i=0; i < colCount + 2; i++) {
                    columns.RelativeColumn();
                }
            });

            ComposeChartLabels(table, 1, startCol, endCol);

            for (var row=endRow; row >= startRow; row--) {
                var rowItems = items.Where(x => x.RowNumber == row).ToList();
                ComposeRow(table, rowItems, endRow - row + 2);
            }

            ComposeChartLabels(table, rowCount+2, startCol, endCol);
        });
    }

    private void ComposeRow(TableDescriptor table, List<ChartRowItem> items, int pageRow) {
        var row = items.Select(x => x.Row).Distinct().First();
        var rowColor = row.Color == 0 ? colorA : colorB;
        var startCol = items.Min(x => x.ColumnNumber);
        var endCol = items.Max(x => x.ColumnNumber);
        var colCount = endCol - startCol + 1;

        ComposeSideLabels(table, pageRow, 1, rowColor, row.RowNumber.ToString());

        for (var colNum = endCol; colNum >= startCol; colNum--) {
            var col = items.First(x => x.ColumnNumber == colNum);

            var colNumber = (uint)(endCol - col.ColumnNumber + 2);
            var cellColor = col.Color == 0 ? colorA : colorB;
            table.Cell().Row((uint)pageRow)
                .Column(colNumber)
                .Background(cellColor)
                .Border(1)
                .AlignCenter()
                .Element(x => { x.Text(col.StitchTypeDisplay).FontSize(FontSize); });
        }

        ComposeSideLabels(table, pageRow, colCount + 2, rowColor, row.RowNumber.ToString());
    }

    private void ComposeChartLabels(TableDescriptor table, int row, int startCol, int endCol) {
        var colCount = endCol - startCol + 1;

        for(var col=endCol; col>=startCol; col--) {
            table.Cell()
                .Row((uint)row)
                .Column((uint)(endCol - col + 2))
                .Border(1)
                .AlignCenter()
                .Element(x => { x.Text(col.ToString()).FontSize(FontSize); });
        }
    }

    private void ComposeSideLabels(TableDescriptor table, int row, int col, string rowColor, string label) {
        table.Cell()
            .Row((uint)row)
            .Column((uint)col)
            .Background(rowColor)
            .Border(1)
            .AlignCenter()
            .Element(x => { x.Text(label).FontSize(FontSize); });
    }
}