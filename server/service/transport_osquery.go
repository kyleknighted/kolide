package service

import (
	"encoding/json"
	"net/http"

	"github.com/kolide/kolide-ose/server/kolide"

	"golang.org/x/net/context"
)

func decodeEnrollAgentRequest(ctx context.Context, r *http.Request) (interface{}, error) {
	var req enrollAgentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}

	return req, nil
}

func decodeGetClientConfigRequest(ctx context.Context, r *http.Request) (interface{}, error) {
	var req getClientConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}

	return req, nil
}

func decodeGetDistributedQueriesRequest(ctx context.Context, r *http.Request) (interface{}, error) {
	var req getDistributedQueriesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}

	return req, nil
}

func decodeSubmitDistributedQueryResultsRequest(ctx context.Context, r *http.Request) (interface{}, error) {
	// When a distributed query has no results, the JSON schema is
	// inconsistent, so we use this shim and massage into a consistent
	// schema. For example (simplified from actual osqueryd 1.8.2 output):
	// {
	// "queries": {
	//   "query_with_no_results": "", // <- Note string instead of array
	//   "query_with_results": [{"foo":"bar","baz":"bang"}]
	//  },
	// "node_key":"IGXCXknWQ1baTa8TZ6rF3kAPZ4\/aTsui"
	// }
	type distributedQueryResultsShim struct {
		NodeKey  string                     `json:"node_key"`
		Results  map[string]json.RawMessage `json:"queries"`
		Statuses map[string]string          `json:"statuses"`
	}

	var shim distributedQueryResultsShim
	if err := json.NewDecoder(r.Body).Decode(&shim); err != nil {
		return nil, err
	}

	results := kolide.OsqueryDistributedQueryResults{}
	for query, raw := range shim.Results {
		queryResults := []map[string]string{}
		// No need to handle error because the empty array is what we
		// want if there was an error parsing the JSON (the error
		// indicates that osquery sent us incosistently schemaed JSON)
		_ = json.Unmarshal(raw, &queryResults)
		results[query] = queryResults
	}

	req := submitDistributedQueryResultsRequest{
		NodeKey:  shim.NodeKey,
		Results:  results,
		Statuses: shim.Statuses,
	}

	return req, nil
}

func decodeSubmitLogsRequest(ctx context.Context, r *http.Request) (interface{}, error) {
	var req submitLogsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}

	return req, nil
}
