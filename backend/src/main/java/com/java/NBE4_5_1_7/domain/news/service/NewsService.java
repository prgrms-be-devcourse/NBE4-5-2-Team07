package com.java.NBE4_5_1_7.domain.news.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.java.NBE4_5_1_7.domain.news.dto.responseDto.NewResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class NewsService {
    @Value("${naver.key}")
    private String client_key;

    @Value("${naver.secret}")
    private String client_secret;

    public NewResponseDto getNaverNews(String keyWord, int page){
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", client_key);
        headers.set("X-Naver-Client-Secret", client_secret);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        int display = 5;
        int start = (page - 1) * display + 1;

        String url = "https://openapi.naver.com/v1/search/news.json"
                + "?query=" + keyWord
                + "&display=" + display
                + "&start=" + start
                + "&sort=date";

        ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        String response = responseEntity.getBody();

        ObjectMapper objectMapper = new ObjectMapper();
        NewResponseDto naverNewsResponse = null;

        try {
            naverNewsResponse = objectMapper.readValue(response, NewResponseDto.class);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return naverNewsResponse;
    }
}