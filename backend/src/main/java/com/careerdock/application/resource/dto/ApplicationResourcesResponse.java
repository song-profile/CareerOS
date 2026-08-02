package com.careerdock.application.resource.dto;

import java.util.List;

public record ApplicationResourcesResponse(
        Long applicationId,
        List<ApplicationFileResponse> files,
        List<ApplicationCredentialResponse> credentials,
        List<ApplicationExternalLinkResponse> externalLinks,
        List<EssayQuestionSummaryResponse> essayQuestions
) {
}
