namespace Deiussum.PatternMaker.Lib.Mosaic;

public class Chart
{
    public int RowCount { get; protected set; }
    public int ColumnCount { get; protected set; }
    public List<ChartRow> Rows { get; protected set; }

    public List<ChartRowItem> AllItems => Rows.SelectMany(x => x.Items).ToList();

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

    public void ToggleSquare(int x, int y) {
        var row = Rows.FirstOrDefault(row => row.RowNumber == y);
        var square = row?.Items.FirstOrDefault(cell => cell.ColumnNumber == x);

        square?.ToggleColor();
    }

    public void SetColor(int x, int y, int color) {
        var row = Rows.FirstOrDefault(row => row.RowNumber == y);
        var square = row?.Items.FirstOrDefault(cell => cell.ColumnNumber == x);

        if (square?.Color != color) square?.ToggleColor();
    }

    public virtual string GetWrittenPattern() {
        return string.Join("\r\n", Rows.OrderBy(x => x.RowNumber).Select(x => x.GetWrittenPattern()));
    }
}


