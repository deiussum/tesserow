using System.Text;

namespace Deiussum.PatternMaker.Lib.Mosaic;

public class ChartRow {
    public int Color { get; set;}
    public int RowNumber { get; private set; }
    public Chart Chart { get; private set;}
    public List<ChartRowItem> Items { get; private set; }

    public ChartRow(Chart chart, int rowNumber) {
        Chart = chart;
        Items = new List<ChartRowItem>();
        RowNumber = rowNumber;
        Color = (rowNumber + 1) % 2;
    }

    public ChartRow(Chart chart, int rowNumber, int initialColumns) : this(chart, rowNumber) {
        Items.AddRange(Enumerable.Range(1, initialColumns)
            .Reverse()
            .Select(x => new ChartRowItem(this, x)));
    }

    public string GetWrittenPattern() {
        var stringBuilder = new StringBuilder();

        stringBuilder.AppendLine($"Row {RowNumber}, Color {Color + 1}");
        stringBuilder.Append("    ");

        var currentStitch = string.Empty;
        var currentCount = 0;
        foreach(var cell in Items.OrderBy(x => x.ColumnNumber)) {
            if (currentStitch == cell.StitchTypeWrittenDisplay) {
                currentCount++;
                continue;
            }

            if (currentCount > 0) {
                stringBuilder.Append($"{currentCount}{currentStitch},");
            }

            currentStitch = cell.StitchTypeWrittenDisplay;
            currentCount = 1;
        }
        // Include last set
        if (currentCount > 0) {
            stringBuilder.Append($"{currentCount}{currentStitch}");
        }

        return stringBuilder.ToString();
    }
}
