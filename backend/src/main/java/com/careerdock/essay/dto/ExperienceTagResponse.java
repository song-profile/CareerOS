package com.careerdock.essay.dto;

import com.careerdock.essay.domain.ExperienceTag;

public record ExperienceTagResponse(Long id, String name, String description) {
    public static ExperienceTagResponse from(ExperienceTag tag) {
        return new ExperienceTagResponse(tag.getId(), tag.getName(), tag.getDescription());
    }
}
