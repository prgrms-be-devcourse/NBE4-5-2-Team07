package com.java.NBE4_5_1_7.domain.news.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.java.NBE4_5_1_7.domain.news.dto.responseDto.NewResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class NewsService {

    @Value("${naver.key}")
    private String client_key;

    @Value("${naver.secret}")
    private String client_secret;

    // 네이버 뉴스 API에서 데이터를 가져오는 메서드
    public NewResponseDto getNaverNews(String keyWord, int display) {
        // RestTemplate 생성
        RestTemplate restTemplate = new RestTemplate();

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", client_key);
        headers.set("X-Naver-Client-Secret", client_secret);

        // 요청 엔티티 생성
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // API URL 설정
        String url = "https://openapi.naver.com/v1/search/news.json"
                + "?query=" + keyWord
                + "&display=" + display
                + "&sort=date";

        // API 요청 보내기
        String response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class).getBody();

        // JSON 응답을 NewResponseDto 객체로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        NewResponseDto naverNewsResponse = null;

        try {
            // ObjectMapper로 응답 파싱
            naverNewsResponse = objectMapper.readValue(response, NewResponseDto.class);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return naverNewsResponse;
    }
}