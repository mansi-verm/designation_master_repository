package com.organization.designation_master.repository;

import com.organization.designation_master.dto.AnalyticsRowDto;
import com.organization.designation_master.dto.DesignationSearchRequestDto;
import com.organization.designation_master.entity.Designation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    Optional<Designation> findByIdAndIsDeletedFalse(Long id);

    Optional<Designation> findByDesignationCodeAndIsDeletedFalse(String designationCode);

    @Query("""
                SELECT d FROM Designation d
                WHERE (:status IS NULL OR d.status = :status)
            """)
    Page<Designation> findDesignationList(@Param("status") Boolean status, Pageable pageable);

    @Query("""
            SELECT COUNT(d)
            FROM Designation d
            """)
    long countAllActive();

    @Query("""
            SELECT COUNT(d)
            FROM Designation d
            WHERE d.status = :status
            """)
    long countByStatus(@Param("status") Boolean status);

    @Query("""
                SELECT COUNT(d) > 0
                FROM Designation d
                WHERE d.isDeleted = false
                  AND (:id IS NULL OR d.id <> :id)
                  AND (LOWER(d.designationCode) = LOWER(:code)
                       OR (d.designationName = :name AND d.departmentId = :departmentId))
            """)
    boolean existsDuplicate(@Param("code") String code, @Param("name") String name, @Param("departmentId") Long departmentId, @Param("id") Long id);

    //    @Query("""
//            SELECT d FROM Designation d
//            WHERE (:departmentId IS NULL OR d.departmentId = :departmentId)
//            AND (:designationLevel IS NULL OR d.designationLevel = :designationLevel)
//            AND (:grade IS NULL OR d.grade = :grade)
//            AND (:status IS NULL OR d.status = :status)
//            AND (:fromDate IS NULL OR d.createdAt >= :fromDate)
//            AND (:toDate IS NULL OR d.createdAt < :toDate)
//            """)
//    List<Designation> search(@Param("departmentId") Long departmentId, @Param("designationLevel") Integer designationLevel, @Param("grade") String grade, @Param("status") Boolean status, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);
    @Query("""
            SELECT d FROM Designation d
            WHERE (:departmentId IS NULL OR d.departmentId = :departmentId)
            AND (:designationLevel IS NULL OR d.designationLevel = :designationLevel)
            AND (:grade IS NULL OR d.grade = :grade)
            AND (:status IS NULL OR d.status = :status)
            AND (:fromDate IS NULL OR d.createdAt >= :fromDate)
            AND (:toDate IS NULL OR d.createdAt < :toDate)
            ORDER BY d.id DESC
            """)
    List<Designation> search(@Param("departmentId") Long departmentId, @Param("designationLevel") Integer designationLevel, @Param("grade") String grade, @Param("status") Boolean status, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    //    @Query("""
//                SELECT new com.organization.designation_master.dto.AnalyticsRowDto(
//                    d.grade,
//                    d.status,
//                    d.departmentId,
//                    d.designationLevel,
//                    d.createdAt
//                )
//                FROM Designation d
//                WHERE d.isDeleted = false
//                  AND (:grade IS NULL OR d.grade = :grade)
//                  AND (:status IS NULL OR d.status = :status)
//                  AND (:departmentId IS NULL OR d.departmentId = :departmentId)
//                  AND (:designationLevel IS NULL OR d.designationLevel = :designationLevel)
//                  AND (:fromDate IS NULL OR d.createdAt IS NULL OR d.createdAt >= :fromDate)
//                  AND (:toDate IS NULL OR d.createdAt IS NULL OR d.createdAt < :toDate)
//            """)
//    List<AnalyticsRowDto> findAnalyticsRows(@Param("grade") String grade, @Param("status") Boolean status, @Param("departmentId") Long departmentId, @Param("designationLevel") Integer designationLevel, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);
    @Query("""
                            SELECT new com.organization.designation_master.dto.AnalyticsRowDto(
                                d.grade,
                                d.status,
                                d.departmentId,
                                d.designationLevel,
                                d.createdAt
                            )
                            FROM Designation d
                            WHERE (:grade IS NULL OR d.grade = :grade)
                              AND (:status IS NULL OR d.status = :status)
                              AND (:departmentId IS NULL OR d.departmentId = :departmentId)
                              AND (:designationLevel IS NULL OR d.designationLevel = :designationLevel)
                              AND (:fromDate IS NULL OR d.createdAt >= :fromDate)
                              AND (:toDate IS NULL OR d.createdAt < :toDate)       
                   """)
    List<AnalyticsRowDto> findAnalyticsRows(@Param("grade") String grade, @Param("status") Boolean status, @Param("departmentId") Long departmentId, @Param("designationLevel") Integer designationLevel, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);


    @Query("""
            SELECT d FROM Designation d
            WHERE d.isDeleted = false
              AND (:departmentId IS NULL OR d.departmentId = :departmentId)
              AND (:designationLevel IS NULL OR d.designationLevel = :designationLevel)
              AND (:grade IS NULL OR d.grade = :grade)
              AND (:status IS NULL OR d.status = :status)
              AND (:fromDate IS NULL OR d.createdAt >= :fromDate)
              AND (:toDate IS NULL OR d.createdAt < :toDate)
              AND (:search = '' OR LOWER(d.designationCode) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(d.designationName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(d.shortName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(d.jobCategory) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(d.grade) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY d.id ASC
            """)
    List<Designation> findForExcel(@Param("departmentId") Long departmentId, @Param("designationLevel") Integer designationLevel, @Param("grade") String grade, @Param("status") Boolean status, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate, @Param("search") String search);
}



//AND (:fromDate IS NULL OR d.createdAt >= :fromDate)
//AND (:toDate IS NULL OR d.createdAt < :toDate)