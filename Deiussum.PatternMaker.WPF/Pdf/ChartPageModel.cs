using Deiussum.PatternMaker.Lib.Mosaic;

namespace Deiussum.PatternMaker.WPF.Pdf;

public class ChartPageModel : Chart {

    public ChartPageModel() { }
    public ChartPageModel(Chart chart) { 
        Rows = chart.Rows;
        RowCount = chart.RowCount;
        ColumnCount = chart.ColumnCount;
    }

    public List<List<ChartRowItem>> GetPagedChartItems(int colsPerPage, int rowsPerPage) {
        var results = new List<List<ChartRowItem>>();
        var colPages = Math.Ceiling((double)ColumnCount / colsPerPage);
        var rowPages = Math.Ceiling((double)RowCount / rowsPerPage);

        for(var rowPage=0; rowPage<rowPages; rowPage++) {
            var rowEnd = RowCount - (rowPage * rowsPerPage);
            var rowStart = rowEnd - rowsPerPage + 1;

            for(var colPage=0; colPage<colPages; colPage++) {
                var colEnd = ColumnCount - (colPage * colsPerPage);
                var colStart = colEnd - colsPerPage + 1;

                var pageItems = AllItems
                    .Where(x => x.Row.RowNumber >= rowStart)
                    .Where(x => x.Row.RowNumber <= rowEnd)
                    .Where(x => x.ColumnNumber >= colStart)
                    .Where(x => x.ColumnNumber <= colEnd)
                    .ToList();

                results.Add(pageItems);
            }
        }

        return results;
    }
}