package com.careerdock.global.domain;

import java.util.UUID;

/**
 * Marker contract for data that must be scoped by the authenticated user's internal id.
 */
public interface UserOwnedResource {

    UUID getOwnerId();
}
