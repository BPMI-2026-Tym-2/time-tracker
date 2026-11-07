import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type UserTablePaginationProps = {
  currentPage: number;
  pageCount: number;
  rowCount: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onPageChange: (page: number) => void;
};

function getVisiblePages(pageCount: number, currentPage: number) {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  return [
    ...new Set([
      0,
      ...Array.from({ length: 3 }, (_, index) => currentPage - 1 + index).filter(
        (page) => page > 0 && page < pageCount - 1,
      ),
      pageCount - 1,
    ]),
  ].sort((left, right) => left - right);
}

export function UserTablePagination({
  currentPage,
  pageCount,
  rowCount,
  canGoBack,
  canGoForward,
  onPageChange,
}: UserTablePaginationProps) {
  const visiblePages = getVisiblePages(pageCount, currentPage);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p aria-live="polite" className="text-slate-600">
        Počet uživatelů: <span className="font-semibold text-slate-900">{rowCount}</span>
      </p>
      {pageCount > 1 && (
        <nav aria-label="Stránkování" className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Předchozí stránka"
            disabled={!canGoBack}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-md border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1];
            return (
              <span key={page} className="contents">
                {previousPage !== undefined && page - previousPage > 1 && (
                  <span aria-hidden="true" className="px-1">
                    …
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Stránka ${page + 1}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                  onClick={() => onPageChange(page)}
                  className={`rounded-md border-slate-200 text-slate-600 hover:bg-slate-50 ${
                    page === currentPage
                      ? 'border-blue-600 bg-blue-600 font-semibold text-white hover:bg-blue-700 hover:text-white'
                      : ''
                  }`}
                >
                  {page + 1}
                </Button>
              </span>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Další stránka"
            disabled={!canGoForward}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-md border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  );
}
