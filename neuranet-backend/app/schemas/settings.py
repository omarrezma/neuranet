from pydantic import BaseModel, ConfigDict


class SettingsBase(BaseModel):
    app_name: str
    company_name: str
    timezone: str
    confidence_threshold: float
    auto_detect: bool
    auto_save_alerts: bool
    network_interface: str
    capture_filter: str
    auto_start_collector: bool


class SettingsUpdate(SettingsBase):
    pass


class SettingsResponse(SettingsBase):
    id: int

    model_config = ConfigDict(from_attributes=True)