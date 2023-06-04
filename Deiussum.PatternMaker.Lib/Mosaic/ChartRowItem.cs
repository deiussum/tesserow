namespace Deiussum.PatternMaker.Lib.Mosaic;

public class ChartRowItem {
    public int Color { get; set; }
    public int StitchType { get; set; }
    public int ColumnNumber { get; private set; }
    public ChartRow Row { get; private set; }

    public string StitchTypeDisplay => StitchType == 0 ? string.Empty : "X";
    public string StitchTypeWrittenDisplay => StitchType == 0 ? "SC" : "DC";
    public bool IsRowColor => Color == Row.Color;

    public ChartRowItem(ChartRow row, int columnNumber) {
        Row = row;
        ColumnNumber = columnNumber;
        Color = row.Color;
    }

    public bool CanToggleColor() {
        var rowBelowSquare = Row.Chart.GetRowBelow(this);
        if (rowBelowSquare == null) return false;
        if (IsRowColor && rowBelowSquare.Color == Row.Color) return false;

        var rowAboveSquare = Row.Chart.GetRowAbove(this);
        if (IsRowColor && rowAboveSquare?.IsRowColor != true) return false;

        return true;
    }

    public bool ToggleColor() {
        if (!CanToggleColor()) return false;

        Color = (Color + 1) % 2;

        // Get double stitch square
        var rowAboveSquare = Row.Chart.GetRowAbove(this);
        if (rowAboveSquare != null) {
            rowAboveSquare.StitchType = (rowAboveSquare.StitchType + 1) % 2;
        }

        return true;
    }
}
