package com.careerdock.global.util;

import java.time.ZoneId;

public final class TimeZoneConstants {

    public static final ZoneId STORAGE_ZONE = ZoneId.of("UTC");
    public static final ZoneId DISPLAY_ZONE_KOREA = ZoneId.of("Asia/Seoul");

    private TimeZoneConstants() {
    }
}
