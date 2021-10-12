from typing import Any, List, Mapping, MutableMapping, Optional, Sequence, Set

from sentry.sentry_metrics.indexer.models import MetricsKeyIndexer
from sentry.utils.services import Service


class PGStringIndexer(Service):  # type: ignore
    """
    Provides integer IDs for metric names, tag keys and tag values
    and the corresponding reverse lookup.
    """

    __all__ = ("record", "resolve", "reverse_resolve", "bulk_record")

    def _bulk_record(self, unmapped_strings: Set[str]) -> Any:
        records = [MetricsKeyIndexer(string=string) for string in unmapped_strings]
        # We use `ignore_conflicts=True` here to avoid race conditions where metric indexer
        # records might have be created between when we queried in `bulk_record` and the
        # attempt to create the rows down below.
        MetricsKeyIndexer.objects.bulk_create(records, ignore_conflicts=True)
        # Using `ignore_conflicts=True` prevents the pk from being set on the model
        # instances.
        #
        # Using `get_many_from_cache` will not only re-query the database to fetch the rows
        # (which should all exist point at this point), but also cache the results
        return MetricsKeyIndexer.objects.get_many_from_cache(list(unmapped_strings), key="string")

    def bulk_record(self, strings: List[str]) -> Mapping[str, int]:

        cache_results: Sequence[Any] = MetricsKeyIndexer.objects.get_many_from_cache(
            strings, key="string"
        )

        mapped_result: MutableMapping[str, int] = {r.string: r.id for r in cache_results}

        unmapped = set(strings).difference(mapped_result.keys())
        new_mapped = self._bulk_record(unmapped)

        for new in new_mapped:
            mapped_result[new.string] = new.id

        return mapped_result

    def record(self, string: str) -> int:
        """Store a string and return the integer ID generated for it"""
        result = self.bulk_record(strings=[string])
        return result[string]

    def resolve(self, string: str) -> Optional[int]:
        """Lookup the integer ID for a string.

        Returns None if the entry cannot be found.
        """
        try:
            id: int = MetricsKeyIndexer.objects.get_from_cache(string=string).id
        except MetricsKeyIndexer.DoesNotExist:
            return None

        return id

    def reverse_resolve(self, id: int) -> Optional[str]:
        """Lookup the stored string for a given integer ID.

        Returns None if the entry cannot be found.
        """
        try:
            string: str = MetricsKeyIndexer.objects.get_from_cache(pk=id).string
        except MetricsKeyIndexer.DoesNotExist:
            return None

        return string