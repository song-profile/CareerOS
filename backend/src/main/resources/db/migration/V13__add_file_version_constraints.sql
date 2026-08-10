CREATE UNIQUE INDEX uq_file_assets_logical_version
    ON file_assets ((COALESCE(parent_asset_id, id)), version);

CREATE INDEX idx_file_assets_parent_asset_id
    ON file_assets (parent_asset_id);
