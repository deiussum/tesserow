namespace Deiussum.PatternMaker.Lib.Mosaic;

public class Chart
{
    public int RowCount { get; private set; }
    public int ColumnCount { get; private set; }
    public List<ChartRow> Rows { get; private set; }

    public Chart()
    {
        RowCount = 0;
        ColumnCount = 0;
        Rows = new List<ChartRow>();
    }

    public Chart(int initialRows, int initialColumns)
        :this()
    {
        Rows.AddRange(Enumerable.Range(1, initialRows)
            .Reverse()
            .Select(x => new ChartRow(this, x, initialColumns)));

        RowCount = initialRows;
        ColumnCount = initialColumns;
    }

    public ChartRowItem? GetRowAbove(ChartRowItem item) {
        if (item.Row.RowNumber >= RowCount) return null;

        var rowAbove = Rows.FirstOrDefault(x => x.RowNumber == item.Row.RowNumber + 1); 
        if (rowAbove == null) return null;

        return rowAbove.Items.FirstOrDefault(x => x.ColumnNumber == item.ColumnNumber);
    }

    public ChartRowItem? GetRowBelow(ChartRowItem item) {
        if (item.Row.RowNumber <= 1) return null;

        var rowBelow = Rows.FirstOrDefault(x => x.RowNumber == item.Row.RowNumber - 1); 
        if (rowBelow == null) return null;

        return rowBelow.Items.FirstOrDefault(x => x.ColumnNumber == item.ColumnNumber);
    }
}


