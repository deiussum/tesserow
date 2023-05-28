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
        Color = rowNumber % 2;
    }

    public ChartRow(Chart chart, int rowNumber, int initialColumns) : this(chart, rowNumber) {
        Items.AddRange(Enumerable.Range(1, initialColumns)
            .Reverse()
            .Select(x => new ChartRowItem(this, x)));

    }
}
