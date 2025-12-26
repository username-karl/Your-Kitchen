package com.yourkitchen.service;

import com.yourkitchen.model.Profile;
import com.yourkitchen.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    @Autowired
    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    public Optional<Profile> getProfileById(UUID id) {
        return profileRepository.findById(id);
    }

    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    public Profile updateProfile(UUID id, Profile profileDetails) {
        return profileRepository.findById(id)
                .map(profile -> {
                    if (profileDetails.getName() != null) {
                        profile.setName(profileDetails.getName());
                    }
                    if (profileDetails.getAnswers() != null) {
                        profile.setAnswers(profileDetails.getAnswers());
                    }
                    if (profileDetails.getWeeklyPlan() != null) {
                        profile.setWeeklyPlan(profileDetails.getWeeklyPlan());
                    }
                    if (profileDetails.getSavedRecipes() != null) {
                        profile.setSavedRecipes(profileDetails.getSavedRecipes());
                    }
                    return profileRepository.save(profile);
                })
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
    }

    public void deleteProfile(UUID id) {
        profileRepository.deleteById(id);
    }

    public void deleteAllProfiles() {
        profileRepository.deleteAll();
    }
}
