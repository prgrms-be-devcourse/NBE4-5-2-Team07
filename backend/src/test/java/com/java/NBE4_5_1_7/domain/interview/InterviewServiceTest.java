package com.java.NBE4_5_1_7.domain.interview;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.KeywordContentRequestDto;
import com.java.NBE4_5_1_7.domain.interview.entity.dto.request.RandomRequestDto;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class InterviewServiceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("카테고리별 머리 질문 ID 목록 조회")
    @WithMockUser(username = "test_user")
    void categoryContentId() throws Exception {
        // When
        ResultActions resultActions = mockMvc.perform(get("/interview/category/DATABASE"));

        // Then
        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").value(org.hamcrest.Matchers.hasItems(1, 4, 7, 10, 13)));

    }

    @Test
    @DisplayName("특정 ID 면접 컨텐츠 단건 조회")
    @WithMockUser(username = "test_user")
    void oneContent() throws Exception {
        // Given
        Long contentId = 1L;

        // When
        ResultActions resultActions = mockMvc.perform(get("/interview/{id}", contentId));

        // Then
        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.question").value("오라클 시퀀스(Oracle Sequence) 는 무엇인가요?"))
                .andExpect(jsonPath("$.model_answer").exists())
                .andExpect(jsonPath("$.category").value("DATABASE"));
    }

    @Test
    @DisplayName("랜덤 면접 컨텐츠 조회")
    @WithMockUser(username = "test_user")
    void randomContent() throws Exception {
        // Given
        List<Long> indexList = Arrays.asList(1L, 4L, 7L);
        RandomRequestDto requestDto = new RandomRequestDto(indexList);

        // When
        ResultActions resultActions = mockMvc.perform(post("/interview/random")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)));

        // Then
        resultActions
                .andExpect(status().isOk())
                .andDo(print())
                .andExpect(jsonPath("$.indexList").isArray())
                .andExpect(jsonPath("$.interviewResponseDto").exists())
                .andExpect(jsonPath("$.interviewResponseDto.question").exists())
                .andExpect(jsonPath("$.interviewResponseDto.model_answer").exists());
    }

    @Test
    @DisplayName("키워드 리스트 조회")
    @WithMockUser(username = "test_user")
    void showKeywordList() throws Exception {
        // When
        ResultActions resultActions = mockMvc.perform(get("/interview/keyword"));

        // Then
        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").value(org.hamcrest.Matchers.hasItems("sequence", "DBMS", "view", "정규화", "이상현상", "무결성")));
    }

    @Test
    @DisplayName("키워드로 질문 ID 조회")
    @WithMockUser(username = "test_user")
    void keywordContentId() throws Exception {

        //given
        List<String> keywordList = Arrays.asList("sequence", "DBMS");
        KeywordContentRequestDto requestDto = new KeywordContentRequestDto(keywordList);

        // When:
        ResultActions resultActions = mockMvc.perform(post("/interview/keyword/content")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)));

        // Then
        resultActions
                .andExpect(status().isOk())
                .andDo(print())
                .andExpect(jsonPath("$").value(org.hamcrest.Matchers.hasItem(1)));

    }
}