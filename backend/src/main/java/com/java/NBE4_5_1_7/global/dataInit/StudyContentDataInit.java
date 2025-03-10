package com.java.NBE4_5_1_7.global.dataInit;

import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import com.opencsv.CSVReader;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudyContentDataInit {
    private final StudyContentRepository repository;

    @PostConstruct
    public void importCsvData() {
        try {
            // 프로젝트 상위 디렉토리의 data 폴더 내 CSV 파일 경로 (파일명은 실제 사용 파일명으로 수정)
            File csvFile = new File("data/학습컨텐츠데이터-종합.csv");
            InputStreamReader streamReader = new InputStreamReader(new FileInputStream(csvFile), StandardCharsets.UTF_8);
            CSVReader csvReader = new CSVReader(streamReader);

            String[] line;
            boolean isFirstLine = true;
            while ((line = csvReader.readNext()) != null) {
                // 첫 줄은 헤더이므로 건너뜁니다.
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                // CSV 컬럼 순서: study_content_id, first_category, second_category, title, body
                // study_content_id는 auto-generated 필드이므로 사용하지 않습니다.
                String firstCategoryStr = line[1].trim();
                FirstCategory firstCategory;
                // CSV 파일의 first_category 값이 "Operating System" 또는 "운영체제" 등으로 올 수 있으므로 매핑
                switch (firstCategoryStr) {
                    case "Computer Architecture":
                    case "컴퓨터구조":
                        firstCategory = FirstCategory.ComputerArchitecture;
                        break;
                    case "Data Structure":
                    case "자료구조":
                        firstCategory = FirstCategory.DataStructure;
                        break;
                    case "Database":
                    case "데이터베이스":
                        firstCategory = FirstCategory.Database;
                        break;
                    case "NetWork":
                    case "네트워크":
                        firstCategory = FirstCategory.Network;
                        break;
                    case "Operating System":
                    case "운영체제":
                        firstCategory = FirstCategory.OperatingSystem;
                        break;
                    case "SoftWare Engineering":
                    case "소프트웨어엔지니어링":
                        firstCategory = FirstCategory.SoftwareEngineering;
                        break;
                    case "Web":
                    case "웹":
                        firstCategory = FirstCategory.Web;
                        break;
                    default:
                        // 기본값으로 Database 할당 (필요시 수정)
                        firstCategory = FirstCategory.Database;
                }
                String secondCategory = line[2].trim();
                String title = line[3].trim();
                String body = line[4].trim();

                Optional<StudyContent> existingContent = repository.findByTitle(title);
                if (existingContent.isPresent()) {
                    continue; // 중복된 데이터가 있으면 저장하지 않음
                }

                StudyContent studyContent = new StudyContent();
                studyContent.setFirstCategory(firstCategory);
                studyContent.setSecondCategory(secondCategory);
                studyContent.setTitle(title);
                studyContent.setBody(body);

                repository.save(studyContent);
            }
            csvReader.close();
        } catch (Exception e) {
            throw new RuntimeException("StudyContent CSV 데이터를 DB에 저장하는데 실패했습니다.", e);
        }
    }
}
