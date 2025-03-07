package com.java.NBE4_5_1_7.global.dataInit;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewCategory;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewContentRepository;
import com.opencsv.CSVReader;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
@Transactional
@RequiredArgsConstructor
public class InterviewContentDataInit {
    private final InterviewContentRepository repository;

//    @PostConstruct
    public void dataInit() {
        importCsvData();
        updateHasTailField();
    }


    public void importCsvData() {
        try {
            // resources 폴더에 위치한 CSV 파일을 불러옴
            File csvFile = new File("data/기술면접컨텐츠데이터-종합.csv");
            InputStreamReader streamReader = new InputStreamReader(new FileInputStream(csvFile), StandardCharsets.UTF_8);
            CSVReader csvReader = new CSVReader(streamReader);

            String[] line;
            boolean isFirstLine = true;
            while ((line = csvReader.readNext()) != null) {
                // 첫 번째 라인은 헤더이므로 건너뜁니다.
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                // CSV 파일의 컬럼 순서: 번호,상위질문번호,카테고리,키워드,질문,답변,상위질문사용가능
                // 번호는 엔티티의 식별자(자동 생성)로 사용하지 않으므로 무시합니다.
                String headIdStr = line[1];
                Long headId = null;
                if (!"NULL".equalsIgnoreCase(headIdStr)) {
                    headId = Long.parseLong(headIdStr);
                }
                String categoryStr = line[2];
                InterviewCategory category;
                // CSV의 '카테고리' 값이 "Database"인 경우 InterviewCategory.DATABASE 사용
                if ("Database".equalsIgnoreCase(categoryStr)) {
                    category = InterviewCategory.DATABASE;
                } else if ("Network".equalsIgnoreCase(categoryStr)) {
                    category = InterviewCategory.NETWORK;
                } else if ("OperatingSystem".equalsIgnoreCase(categoryStr)) {
                    category = InterviewCategory.OperatingSystem;
                } else if ("Spring".equalsIgnoreCase(categoryStr)) {
                    category = InterviewCategory.SPRING;
                } else {
                    // 기본값: DATABASE (필요에 따라 수정)
                    category = null;
                    System.out.println("category 설정 오류로 인해 null 값 적용.");
                }
                String keyword = line[3];
                String question = line[4];
                String modelAnswer = line[5];
                boolean isHead = "TRUE".equalsIgnoreCase(line[6]);

                InterviewContent content = new InterviewContent();
                content.setHead_id(headId);
                content.setCategory(category);
                content.setKeyword(keyword);
                content.setQuestion(question);
                content.setModelAnswer(modelAnswer);
                content.setHead(isHead);

                repository.save(content);
            }
            csvReader.close();
        } catch (Exception e) {
            throw new RuntimeException("CSV 데이터를 DB에 저장하는데 실패했습니다.", e);
        }
    }

    @Transactional
    public void updateHasTailField() {
        repository.findAll().stream().filter(interview -> interview.getHead_id() != null).forEach(tail -> {
            InterviewContent head = repository.findById(tail.getHead_id()).orElseThrow(() -> new RuntimeException("해당 컨텐츠를 찾을 수 없습니다."));
            head.setHasTail(true);
            head.setTail_id(tail.getInterview_content_id());
            repository.save(head);
        });
    }
}
