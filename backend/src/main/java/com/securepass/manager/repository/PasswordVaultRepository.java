package com.securepass.manager.repository;

import com.securepass.manager.entity.PasswordVault;
import com.securepass.manager.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordVaultRepository extends JpaRepository<PasswordVault, Long> {
    List<PasswordVault> findByUserOrderByUpdatedAtDesc(User user);

    Optional<PasswordVault> findByIdAndUser(Long id, User user);

    @Query("""
            select v from PasswordVault v
            where v.user = :user
              and (
                lower(v.title) like lower(concat('%', :query, '%'))
                or lower(v.username) like lower(concat('%', :query, '%'))
                or lower(coalesce(v.websiteUrl, '')) like lower(concat('%', :query, '%'))
              )
            order by v.updatedAt desc
            """)
    List<PasswordVault> search(@Param("user") User user, @Param("query") String query);
}
