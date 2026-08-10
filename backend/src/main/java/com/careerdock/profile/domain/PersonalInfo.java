package com.careerdock.profile.domain;

import com.careerdock.global.domain.BaseTimeEntity;
import com.careerdock.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "personal_infos",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_personal_infos_user_id", columnNames = "user_id")
        }
)
public class PersonalInfo extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 30)
    private String phone;

    @Column(length = 300)
    private String address;

    @Column(name = "school_name", length = 150)
    private String schoolName;

    @Column(length = 150)
    private String major;

    @Column(name = "double_major", length = 150)
    private String doubleMajor;

    @Column(length = 150)
    private String minor;

    @Enumerated(EnumType.STRING)
    @Column(name = "graduation_status", length = 30)
    private GraduationStatus graduationStatus;

    @Column(name = "graduation_date")
    private LocalDate graduationDate;

    @Column(precision = 4, scale = 2)
    private BigDecimal gpa;

    @Column(name = "gpa_scale", precision = 4, scale = 2)
    private BigDecimal gpaScale;

    @Enumerated(EnumType.STRING)
    @Column(name = "military_status", length = 30)
    private MilitaryStatus militaryStatus;

    @Column(name = "military_branch", length = 50)
    private String militaryBranch;

    @Column(name = "military_rank", length = 50)
    private String militaryRank;

    @Column(name = "military_discharge_date")
    private LocalDate militaryDischargeDate;

    @Column(name = "career_summary", length = 1000)
    private String careerSummary;

    protected PersonalInfo() {
    }

    private PersonalInfo(User user) {
        this.user = user;
    }

    public static PersonalInfo create(User user) {
        return new PersonalInfo(user);
    }

    public void update(
            String phone,
            String address,
            String schoolName,
            String major,
            String doubleMajor,
            String minor,
            GraduationStatus graduationStatus,
            LocalDate graduationDate,
            BigDecimal gpa,
            BigDecimal gpaScale,
            MilitaryStatus militaryStatus,
            String militaryBranch,
            String militaryRank,
            LocalDate militaryDischargeDate,
            String careerSummary
    ) {
        this.phone = phone;
        this.address = address;
        this.schoolName = schoolName;
        this.major = major;
        this.doubleMajor = doubleMajor;
        this.minor = minor;
        this.graduationStatus = graduationStatus;
        this.graduationDate = graduationDate;
        this.gpa = gpa;
        this.gpaScale = gpaScale;
        this.militaryStatus = militaryStatus;
        this.militaryBranch = militaryBranch;
        this.militaryRank = militaryRank;
        this.militaryDischargeDate = militaryDischargeDate;
        this.careerSummary = careerSummary;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return user.getId();
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public String getMajor() {
        return major;
    }

    public String getDoubleMajor() {
        return doubleMajor;
    }

    public String getMinor() {
        return minor;
    }

    public GraduationStatus getGraduationStatus() {
        return graduationStatus;
    }

    public LocalDate getGraduationDate() {
        return graduationDate;
    }

    public BigDecimal getGpa() {
        return gpa;
    }

    public BigDecimal getGpaScale() {
        return gpaScale;
    }

    public MilitaryStatus getMilitaryStatus() {
        return militaryStatus;
    }

    public String getMilitaryBranch() {
        return militaryBranch;
    }

    public String getMilitaryRank() {
        return militaryRank;
    }

    public LocalDate getMilitaryDischargeDate() {
        return militaryDischargeDate;
    }

    public String getCareerSummary() {
        return careerSummary;
    }
}
