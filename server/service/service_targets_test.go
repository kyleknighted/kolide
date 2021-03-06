package service

import (
	"fmt"
	"testing"
	"time"

	"github.com/WatchBeam/clock"
	"github.com/kolide/kolide-ose/server/config"
	"github.com/kolide/kolide-ose/server/datastore/inmem"
	"github.com/kolide/kolide-ose/server/kolide"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/net/context"
)

func TestSearchTargets(t *testing.T) {
	ds, err := inmem.New(config.TestConfig())
	require.Nil(t, err)

	svc, err := newTestService(ds, nil)
	require.Nil(t, err)

	ctx := context.Background()

	h1, err := ds.NewHost(&kolide.Host{
		HostName: "foo.local",
	})
	require.Nil(t, err)

	l1, err := ds.NewLabel(&kolide.Label{
		Name:  "label foo",
		Query: "query foo",
	})
	require.Nil(t, err)

	results, err := svc.SearchTargets(ctx, "foo", nil, nil)
	require.Nil(t, err)

	require.Len(t, results.Hosts, 1)
	assert.Equal(t, h1.HostName, results.Hosts[0].HostName)

	require.Len(t, results.Labels, 1)
	assert.Equal(t, l1.Name, results.Labels[0].Name)
}

func TestCountHostsInTargets(t *testing.T) {
	ds, err := inmem.New(config.TestConfig())
	require.Nil(t, err)

	mockClock := clock.NewMockClock()

	svc, err := newTestServiceWithClock(ds, nil, mockClock)
	require.Nil(t, err)

	ctx := context.Background()

	h1, err := ds.NewHost(&kolide.Host{
		HostName: "foo.local",
		NodeKey:  "1",
		UUID:     "1",
	})
	require.Nil(t, err)
	require.Nil(t, ds.MarkHostSeen(h1, mockClock.Now()))

	h2, err := ds.NewHost(&kolide.Host{
		HostName: "bar.local",
		NodeKey:  "2",
		UUID:     "2",
	})
	require.Nil(t, err)
	// make this host "offline"
	require.Nil(t, ds.MarkHostSeen(h2, mockClock.Now().Add(-1*time.Hour)))

	h3, err := ds.NewHost(&kolide.Host{
		HostName: "baz.local",
		NodeKey:  "3",
		UUID:     "3",
	})
	require.Nil(t, err)
	require.Nil(t, ds.MarkHostSeen(h3, mockClock.Now().Add(-5*time.Minute)))

	h4, err := ds.NewHost(&kolide.Host{
		HostName: "xxx.local",
		NodeKey:  "4",
		UUID:     "4",
	})
	require.Nil(t, err)
	require.Nil(t, ds.MarkHostSeen(h4, mockClock.Now()))

	h5, err := ds.NewHost(&kolide.Host{
		HostName: "yyy.local",
		NodeKey:  "5",
		UUID:     "5",
	})
	require.Nil(t, err)
	require.Nil(t, ds.MarkHostSeen(h5, mockClock.Now()))

	h6, err := ds.NewHost(&kolide.Host{
		HostName: "zzz.local",
		NodeKey:  "6",
		UUID:     "6",
	})
	require.Nil(t, err)
	const thirtyDaysAndAMinuteAgo = -1 * (30*24*60 + 1)
	require.Nil(t, ds.MarkHostSeen(h6, mockClock.Now().Add(thirtyDaysAndAMinuteAgo*time.Minute)))

	l1, err := ds.NewLabel(&kolide.Label{
		Name:  "label foo",
		Query: "query foo",
	})
	require.Nil(t, err)
	require.NotZero(t, l1.ID)

	l2, err := ds.NewLabel(&kolide.Label{
		Name:  "label bar",
		Query: "query foo",
	})
	require.Nil(t, err)
	require.NotZero(t, l2.ID)

	for _, h := range []*kolide.Host{h1, h2, h3, h6} {
		err = ds.RecordLabelQueryExecutions(h, map[uint]bool{l1.ID: true}, mockClock.Now())
		assert.Nil(t, err)
	}

	for _, h := range []*kolide.Host{h3, h4, h5} {
		err = ds.RecordLabelQueryExecutions(h, map[uint]bool{l2.ID: true}, mockClock.Now())
		assert.Nil(t, err)
	}

	metrics, err := svc.CountHostsInTargets(ctx, nil, []uint{l1.ID, l2.ID})
	require.Nil(t, err)
	require.NotNil(t, metrics)
	assert.Equal(t, uint(6), metrics.TotalHosts)
	assert.Equal(t, uint(1), metrics.OfflineHosts)
	assert.Equal(t, uint(4), metrics.OnlineHosts)
	assert.Equal(t, uint(1), metrics.MissingInActionHosts)

	metrics, err = svc.CountHostsInTargets(ctx, []uint{h1.ID, h2.ID}, []uint{l1.ID, l2.ID})
	require.Nil(t, err)
	require.NotNil(t, metrics)
	assert.Equal(t, uint(6), metrics.TotalHosts)
	assert.Equal(t, uint(1), metrics.OfflineHosts)
	assert.Equal(t, uint(4), metrics.OnlineHosts)
	assert.Equal(t, uint(1), metrics.MissingInActionHosts)

	metrics, err = svc.CountHostsInTargets(ctx, []uint{h1.ID, h2.ID}, nil)
	require.Nil(t, err)
	require.NotNil(t, metrics)
	assert.Equal(t, uint(2), metrics.TotalHosts)
	assert.Equal(t, uint(1), metrics.OnlineHosts)
	assert.Equal(t, uint(1), metrics.OfflineHosts)
	assert.Equal(t, uint(0), metrics.MissingInActionHosts)

	metrics, err = svc.CountHostsInTargets(ctx, []uint{h1.ID}, []uint{l2.ID})
	require.Nil(t, err)
	require.NotNil(t, metrics)
	assert.Equal(t, uint(4), metrics.TotalHosts)
	assert.Equal(t, uint(4), metrics.OnlineHosts)
	assert.Equal(t, uint(0), metrics.OfflineHosts)
	assert.Equal(t, uint(0), metrics.MissingInActionHosts)

	metrics, err = svc.CountHostsInTargets(ctx, nil, nil)
	require.Nil(t, err)
	require.NotNil(t, metrics)
	assert.Equal(t, uint(0), metrics.TotalHosts)
	assert.Equal(t, uint(0), metrics.OnlineHosts)
	assert.Equal(t, uint(0), metrics.OfflineHosts)
	assert.Equal(t, uint(0), metrics.MissingInActionHosts)

	// Advance clock so all hosts are offline
	mockClock.AddTime(1 * time.Hour)
	metrics, err = svc.CountHostsInTargets(ctx, nil, []uint{l1.ID, l2.ID})
	require.Nil(t, err)
	require.NotNil(t, metrics)
	assert.Equal(t, uint(6), metrics.TotalHosts)
	assert.Equal(t, uint(0), metrics.OnlineHosts)
	assert.Equal(t, uint(5), metrics.OfflineHosts)
	assert.Equal(t, uint(1), metrics.MissingInActionHosts)

}

func TestSearchWithOmit(t *testing.T) {
	ds, err := inmem.New(config.TestConfig())
	require.Nil(t, err)

	svc, err := newTestService(ds, nil)
	require.Nil(t, err)

	ctx := context.Background()

	h1, err := ds.NewHost(&kolide.Host{
		HostName: "foo.local",
		NodeKey:  "1",
		UUID:     "1",
	})
	require.Nil(t, err)

	h2, err := ds.NewHost(&kolide.Host{
		HostName: "foobar.local",
		NodeKey:  "2",
		UUID:     "2",
	})
	require.Nil(t, err)

	l1, err := ds.NewLabel(&kolide.Label{
		Name:  "label foo",
		Query: "query foo",
	})

	{
		results, err := svc.SearchTargets(ctx, "foo", nil, nil)
		require.Nil(t, err)

		require.Len(t, results.Hosts, 2)

		require.Len(t, results.Labels, 1)
		assert.Equal(t, l1.Name, results.Labels[0].Name)
	}

	{
		results, err := svc.SearchTargets(ctx, "foo", []uint{h2.ID}, nil)
		require.Nil(t, err)

		require.Len(t, results.Hosts, 1)
		assert.Equal(t, h1.HostName, results.Hosts[0].HostName)

		require.Len(t, results.Labels, 1)
		assert.Equal(t, l1.Name, results.Labels[0].Name)
	}
}

func TestSearchHostsInLabels(t *testing.T) {
	ds, err := inmem.New(config.TestConfig())
	require.Nil(t, err)

	svc, err := newTestService(ds, nil)
	require.Nil(t, err)

	ctx := context.Background()

	h1, err := ds.NewHost(&kolide.Host{
		HostName: "foo.local",
		NodeKey:  "1",
		UUID:     "1",
	})
	require.Nil(t, err)

	h2, err := ds.NewHost(&kolide.Host{
		HostName: "bar.local",
		NodeKey:  "2",
		UUID:     "2",
	})
	require.Nil(t, err)

	h3, err := ds.NewHost(&kolide.Host{
		HostName: "baz.local",
		NodeKey:  "3",
		UUID:     "3",
	})
	require.Nil(t, err)

	l1, err := ds.NewLabel(&kolide.Label{
		Name:  "label foo",
		Query: "query foo",
	})
	require.Nil(t, err)
	require.NotZero(t, l1.ID)

	for _, h := range []*kolide.Host{h1, h2, h3} {
		err = ds.RecordLabelQueryExecutions(h, map[uint]bool{l1.ID: true}, time.Now())
		assert.Nil(t, err)
	}

	results, err := svc.SearchTargets(ctx, "baz", nil, nil)
	require.Nil(t, err)

	require.Len(t, results.Hosts, 1)
	assert.Equal(t, h3.HostName, results.Hosts[0].HostName)
}

func TestSearchResultsLimit(t *testing.T) {
	ds, err := inmem.New(config.TestConfig())
	require.Nil(t, err)

	svc, err := newTestService(ds, nil)
	require.Nil(t, err)

	ctx := context.Background()

	for i := 0; i < 15; i++ {
		_, err := ds.NewHost(&kolide.Host{
			HostName: fmt.Sprintf("foo.%d.local", i),
			NodeKey:  fmt.Sprintf("%d", i+1),
			UUID:     fmt.Sprintf("%d", i+1),
		})
		require.Nil(t, err)
	}
	targets, err := svc.SearchTargets(ctx, "foo", nil, nil)
	require.Nil(t, err)
	assert.Len(t, targets.Hosts, 10)
}
