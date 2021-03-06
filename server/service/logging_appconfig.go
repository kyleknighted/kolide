package service

import (
	"time"

	"github.com/kolide/kolide-ose/server/kolide"
	"golang.org/x/net/context"
)

func (mw loggingMiddleware) NewAppConfig(ctx context.Context, p kolide.AppConfigPayload) (*kolide.AppConfig, error) {
	var (
		info *kolide.AppConfig
		err  error
	)

	defer func(begin time.Time) {
		_ = mw.logger.Log(
			"method", "NewAppConfig",
			"err", err,
			"took", time.Since(begin),
		)
	}(time.Now())

	info, err = mw.Service.NewAppConfig(ctx, p)
	return info, err
}

func (mw loggingMiddleware) AppConfig(ctx context.Context) (*kolide.AppConfig, error) {
	var (
		info *kolide.AppConfig
		err  error
	)

	defer func(begin time.Time) {
		_ = mw.logger.Log(
			"method", "AppConfig",
			"err", err,
			"took", time.Since(begin),
		)
	}(time.Now())

	info, err = mw.Service.AppConfig(ctx)
	return info, err
}

func (mw loggingMiddleware) ModifyAppConfig(ctx context.Context, p kolide.AppConfigPayload) (*kolide.AppConfig, error) {
	var (
		info *kolide.AppConfig
		err  error
	)

	defer func(begin time.Time) {
		_ = mw.logger.Log(
			"method", "ModifyAppConfig",
			"err", err,
			"took", time.Since(begin),
		)
	}(time.Now())

	info, err = mw.Service.ModifyAppConfig(ctx, p)
	return info, err
}
