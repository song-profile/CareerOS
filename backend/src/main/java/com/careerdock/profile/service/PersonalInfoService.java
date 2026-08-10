package com.careerdock.profile.service;

import com.careerdock.global.exception.NotFoundException;
import com.careerdock.profile.domain.PersonalInfo;
import com.careerdock.profile.dto.PersonalInfoRequest;
import com.careerdock.profile.dto.PersonalInfoResponse;
import com.careerdock.profile.repository.PersonalInfoRepository;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PersonalInfoService {

    private final PersonalInfoRepository personalInfoRepository;
    private final UserRepository userRepository;

    public PersonalInfoService(PersonalInfoRepository personalInfoRepository, UserRepository userRepository) {
        this.personalInfoRepository = personalInfoRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PersonalInfoResponse find(Long userId) {
        return personalInfoRepository.findByUser_Id(userId)
                .map(PersonalInfoResponse::from)
                .orElseGet(PersonalInfoResponse::empty);
    }

    @Transactional
    public PersonalInfoResponse update(Long userId, PersonalInfoRequest request) {
        PersonalInfo personalInfo = personalInfoRepository.findByUser_Id(userId)
                .orElseGet(() -> PersonalInfo.create(getUser(userId)));
        personalInfo.update(
                normalize(request.phone()),
                normalize(request.address()),
                normalize(request.schoolName()),
                normalize(request.major()),
                normalize(request.doubleMajor()),
                normalize(request.minor()),
                request.graduationStatus(),
                request.graduationDate(),
                request.gpa(),
                request.gpaScale(),
                request.militaryStatus(),
                normalize(request.militaryBranch()),
                normalize(request.militaryRank()),
                request.militaryDischargeDate(),
                normalize(request.careerSummary())
        );
        return PersonalInfoResponse.from(personalInfoRepository.save(personalInfo));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
