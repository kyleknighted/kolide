package service

import (
	"fmt"

	"github.com/go-kit/kit/endpoint"
	"github.com/kolide/kolide-ose/server/contexts/viewer"
	"github.com/kolide/kolide-ose/server/kolide"
	"golang.org/x/net/context"
)

type appConfigRequest struct {
	Payload kolide.AppConfigPayload
}

type appConfigResponse struct {
	OrgInfo        *kolide.OrgInfo             `json:"org_info,omitemtpy"`
	ServerSettings *kolide.ServerSettings      `json:"server_settings,omitempty"`
	SMTPSettings   *kolide.SMTPSettingsPayload `json:"smtp_settings,omitempty"`
	Err            error                       `json:"error,omitempty"`
}

func (r appConfigResponse) error() error { return r.Err }

func makeGetAppConfigEndpoint(svc kolide.Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		vc, ok := viewer.FromContext(ctx)
		if !ok {
			return nil, fmt.Errorf("could not fetch user")
		}
		config, err := svc.AppConfig(ctx)
		if err != nil {
			return nil, err
		}
		var smtpSettings *kolide.SMTPSettingsPayload
		// only admin can see smtp settings
		if vc.IsAdmin() {
			smtpSettings = smtpSettingsFromAppConfig(config)
			if smtpSettings.SMTPPassword != nil {
				*smtpSettings.SMTPPassword = "********"
			}
		}
		response := appConfigResponse{
			OrgInfo: &kolide.OrgInfo{
				OrgName:    &config.OrgName,
				OrgLogoURL: &config.OrgLogoURL,
			},
			ServerSettings: &kolide.ServerSettings{
				KolideServerURL: &config.KolideServerURL,
			},
			SMTPSettings: smtpSettings,
		}
		return response, nil
	}
}

func makeModifyAppConfigEndpoint(svc kolide.Service) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(appConfigRequest)
		config, err := svc.ModifyAppConfig(ctx, req.Payload)
		if err != nil {
			return appConfigResponse{Err: err}, nil
		}
		response := appConfigResponse{
			OrgInfo: &kolide.OrgInfo{
				OrgName:    &config.OrgName,
				OrgLogoURL: &config.OrgLogoURL,
			},
			ServerSettings: &kolide.ServerSettings{
				KolideServerURL: &config.KolideServerURL,
			},
			SMTPSettings: smtpSettingsFromAppConfig(config),
		}
		if response.SMTPSettings.SMTPPassword != nil {
			*response.SMTPSettings.SMTPPassword = "********"
		}
		return response, nil
	}
}

func smtpSettingsFromAppConfig(config *kolide.AppConfig) *kolide.SMTPSettingsPayload {
	authType := config.SMTPAuthenticationType.String()
	authMethod := config.SMTPAuthenticationMethod.String()
	return &kolide.SMTPSettingsPayload{
		SMTPConfigured:           &config.SMTPConfigured,
		SMTPSenderAddress:        &config.SMTPSenderAddress,
		SMTPServer:               &config.SMTPServer,
		SMTPPort:                 &config.SMTPPort,
		SMTPAuthenticationType:   &authType,
		SMTPUserName:             &config.SMTPUserName,
		SMTPPassword:             &config.SMTPPassword,
		SMTPEnableTLS:            &config.SMTPEnableTLS,
		SMTPAuthenticationMethod: &authMethod,
		SMTPDomain:               &config.SMTPDomain,
		SMTPVerifySSLCerts:       &config.SMTPVerifySSLCerts,
		SMTPEnableStartTLS:       &config.SMTPEnableStartTLS,
	}
}
