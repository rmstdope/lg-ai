# Todo HTTP API

This document describes the full HTTP interface for the **Todo** resources only (health & stats endpoints intentionally omitted).

Base URL examples (adjust `PORT` as needed):
```
http://localhost:3000
```
All responses are JSON. All requests with bodies must send `Content-Type: application/json`.

---
## Data Model

### Todo Object
```jsonc
{
  "id": "uuid-v4",
  "title": "string (1..200)",
  "description": "string? (<= 10000)",
  "status": "todo | in_progress | done | archived",
  "priority": 1,            // integer 1..5
  "tags": ["string"],       // each 1..30 chars, [A-Za-z0-9-_\/], up to 20 items
  "dueAt": "ISO8601?",      // nullable / omitted
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "version": 1               // optimistic concurrency token
}
```

### Status Enum
```
- todo
- in_progress
- done
- archived
```

### Error Object
```jsonc
{
  "code": 400 | 409 | 422 | 404 | 500,
  "message": "Human readable",
  "field": "optional field name (only for validation)",
  "current": { /* Todo */ } // only present on 409 version conflict
}
```

---
## List Todos
`GET /todos`

Retrieve a paginated collection of todos with rich filtering & sorting.

### Query Parameters
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `q` | string | — | Case-insensitive substring match on title OR description. Trimmed & capped at 200 chars. |
| `status` | enum Status | — | Filter by status. |
| `tag` | string | — | Filter to todos having this tag. Exact match. |
| `overdue` | `true` | — | If `true`, only todos with `dueAt < now` and status NOT IN (done, archived). |
| `sort` | `createdAt|updatedAt|dueAt|priority|title` | `updatedAt` | Sort key. |
| `order` | `asc|desc` | `desc` | Sort direction. |
| `page` | int (>=1) | 1 | 1-based page number. |
| `pageSize` | int (1..100) | 10 | Items per page (capped at 100). |

### Response
```jsonc
{
  "items": [ /* Todo[] */ ],
  "page": 1,
  "pageSize": 10,
  "total": 42
}
```

### Examples
List first page (defaults):
```bash
curl -s 'http://localhost:3000/todos' | jq .
```

Filter by status & tag:
```bash
curl -s 'http://localhost:3000/todos?status=todo&tag=api'
```

Search (title or description contains "refactor"):
```bash
curl -s 'http://localhost:3000/todos?q=refactor'
```

Overdue only (still active):
```bash
curl -s 'http://localhost:3000/todos?overdue=true'
```

Sort by priority ascending (higher urgency first if you define priority 1 as highest):
```bash
curl -s 'http://localhost:3000/todos?sort=priority&order=asc'
```

Pagination (page 2 of 5-size pages):
```bash
curl -s 'http://localhost:3000/todos?page=2&pageSize=5'
```

Combined example:
```bash
curl -s 'http://localhost:3000/todos?status=todo&tag=planning&q=roadmap&sort=dueAt&order=asc&page=1&pageSize=5'
```

---
## Get Single Todo
`GET /todos/:id`

### Response
- `200` → `Todo`
- `404` if not found.

Example:
```bash
curl -s http://localhost:3000/todos/6c9c3d63-5d6a-4a13-b8e4-a02b8ef832aa | jq .
```

---
## Create Todo
`POST /todos`

### Request Body
```jsonc
{
  "title": "required string (1..200)",
  "description": "optional string (<=10000)",
  "status": "optional Status (default todo)",
  "priority": 1,            // optional int 1..5 (default 3)
  "dueAt": "2025-12-15T10:00:00.000Z", // optional ISO8601
  "tags": ["tag1", "tag2"]            // optional array, each 1..30 chars
}
```

### Responses
- `201` → Created `Todo`
- `422` → Validation error

### Examples
Minimal:
```bash
curl -s -X POST http://localhost:3000/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"Write release notes"}' | jq .
```

With all fields:
```bash
curl -s -X POST http://localhost:3000/todos \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Prepare sprint demo",
    "description":"Collect features and build slides",
    "status":"todo",
    "priority":2,
    "dueAt":"'"$(date -u -v+2d '+%Y-%m-%dT%H:%M:%SZ')"'",
    "tags":["demo","internal"]
  }' | jq .
```

Capture ID + version for later:
```bash
CREATE=$(curl -s -X POST http://localhost:3000/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"Refactor auth","priority":1,"tags":["auth","refactor"]}')
ID=$(echo "$CREATE" | jq -r .id)
VER=$(echo "$CREATE" | jq -r .version)
echo "Created: $ID version=$VER"
```

---
## Update (Patch) Todo
`PATCH /todos/:id`

Optimistic concurrency required via `If-Match: <version>` header.

### Request Body (partial)
Any subset of:
```jsonc
{
  "title": "...",
  "description": "...",
  "status": "in_progress",
  "priority": 1,
  "dueAt": "2025-12-27T08:00:00.000Z",
  "tags": ["a","b"]  // full replacement if provided (send [] to clear)
}
```

### Responses
- `200` → Updated `Todo` (with incremented `version`)
- `400` → Missing / invalid `If-Match`
- `404` → Not found
- `409` → Version conflict (returns current server copy)
- `422` → Validation error

### Examples
Successful patch:
```bash
curl -s -X PATCH http://localhost:3000/todos/$ID \
  -H "Content-Type: application/json" \
  -H "If-Match: $VER" \
  -d '{"status":"in_progress","priority":2}' | jq .
```

Replace tags:
```bash
curl -s -X PATCH http://localhost:3000/todos/$ID \
  -H 'Content-Type: application/json' \
  -H "If-Match: $VER" \
  -d '{"tags":["backend","fast-track"]}' | jq .
```

Clear tags (empty array):
```bash
curl -s -X PATCH http://localhost:3000/todos/$ID \
  -H 'Content-Type: application/json' \
  -H "If-Match: $VER" \
  -d '{"tags":[]}' | jq .
```

Conflict (simulate using stale version):
```bash
curl -s -X PATCH http://localhost:3000/todos/$ID \
  -H 'Content-Type: application/json' \
  -H 'If-Match: 1' \
  -d '{"status":"done"}' | jq .
# Expect { code:409, message:"Version conflict", current:{...} }
```

Invalid header:
```bash
curl -s -X PATCH http://localhost:3000/todos/$ID \
  -H 'Content-Type: application/json' \
  -H 'If-Match: banana' \
  -d '{"status":"done"}' | jq .
```

### Optimistic Concurrency Notes
- Client MUST send `If-Match` with the last observed `version`.
- Server compares to stored value; mismatch → 409 + current representation.
- After a successful patch, client should use the new `version` for the next update.

---
## Delete Todo
`DELETE /todos/:id`

### Responses
- `204` → Deleted (idempotent; deleting an already-deleted id still returns 204)

Example:
```bash
curl -i -X DELETE http://localhost:3000/todos/$ID
```

---
## Validation Summary
| Field | Rules |
|-------|-------|
| title | required, trimmed, length 1..200 |
| description | optional, length <= 10,000 |
| status | enum (todo, in_progress, done, archived) |
| priority | integer 1..5 (default 3) |
| dueAt | ISO8601 valid date string |
| tags | array length 0..20; each 1..30 chars; regex: `[A-Za-z0-9-_\\/]` |

### Error Codes
| Code | Meaning |
|------|---------|
| 400 | Bad query param / missing required header |
| 404 | Resource not found |
| 409 | Version conflict (optimistic concurrency) |
| 422 | Field validation error |
| 500 | Unexpected server error |

---
## Typical Flow Example (End-to-End)
```bash
# 1. Create
NEW=$(curl -s -X POST http://localhost:3000/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"Draft blog post","priority":2,"tags":["writing","content"]}')
ID=$(echo "$NEW" | jq -r .id)
VER=$(echo "$NEW" | jq -r .version)

# 2. Patch (advance status)
UPDATED=$(curl -s -X PATCH http://localhost:3000/todos/$ID \
  -H 'Content-Type: application/json' -H "If-Match: $VER" \
  -d '{"status":"in_progress"}')
NEW_VER=$(echo "$UPDATED" | jq -r .version)

# 3. List with filter
curl -s 'http://localhost:3000/todos?status=in_progress' | jq '.items[] | select(.id=="'$ID'")'

# 4. Complete
curl -s -X PATCH http://localhost:3000/todos/$ID \
  -H 'Content-Type: application/json' -H "If-Match: $NEW_VER" \
  -d '{"status":"done"}' | jq .

# 5. Delete
curl -s -X DELETE http://localhost:3000/todos/$ID -i | head -n 1
```

---
## Design Notes
- Reads are simple SELECTs; lists aggregate tags with `GROUP_CONCAT`.
- Writes wrap related operations in a transaction (insert + tags or update + tag replacement).
- Tag replacement uses delete + insert to keep logic simple; small dataset expectation.
- Pagination uses LIMIT/OFFSET; for very large tables you might switch to keyset pagination.
- Overdue logic recalculated at query time to avoid stale flags.

---
## Future Extensions (Ideas)
- Bulk add/remove tags endpoints.
- Multi-tag filtering with AND / OR semantics.
- Soft delete vs archive distinction.
- WebSocket push on updates.
- ETag headers mirroring `version`.

---
Happy building!
