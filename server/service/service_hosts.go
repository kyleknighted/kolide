package service

import (
	"github.com/kolide/kolide-ose/server/kolide"
	"golang.org/x/net/context"
)

func (svc service) ListHosts(ctx context.Context, opt kolide.ListOptions) ([]*kolide.Host, error) {
	return svc.ds.ListHosts(opt)
}

func (svc service) GetHost(ctx context.Context, id uint) (*kolide.Host, error) {
	return svc.ds.Host(id)
}

func (svc service) GetHostSummary(ctx context.Context) (*kolide.HostSummary, error) {
	online, offline, mia, err := svc.ds.GenerateHostStatusStatistics(svc.clock.Now())
	if err != nil {
		return nil, err
	}
	return &kolide.HostSummary{
		OnlineCount:  online,
		OfflineCount: offline,
		MIACount:     mia,
	}, nil
}

func (svc service) DeleteHost(ctx context.Context, id uint) error {
	return svc.ds.DeleteHost(id)
}
