# django-rest-react-docker
Simple table app for User and Group tables.


The filter API provides two main methods

Filter - filters based on query.

Exclude - same as filter but excludes items based on the query, to use it you need to use the "exclude_" prefix before the query, e.g. "exclude_exact".

Queries and types

Supported data type for all queries (except any) str.

exact - exact match (for each field)

from - starting from (for id and create fields)

until - ending with (for id and create fields)

like - can include case-insensitive (for all fields except id and create)

any - any of the list (all fields except id and create) supported data type list []

start - start with (everything except id and created) case-insensitive

end - end with (everything except id and created) case-insensitive

Input for Id field must not contain letters.


