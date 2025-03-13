package com.java.NBE4_5_1_7.domain.news.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.java.NBE4_5_1_7.domain.news.dto.responseDto.JobResponseDto;
import com.java.NBE4_5_1_7.domain.news.dto.responseDto.JobsDetailDto;
import com.java.NBE4_5_1_7.domain.news.dto.responseDto.NewResponseDto;
import lombok.RequiredArgsConstructor;
import net.minidev.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsService {
    @Value("${naver.key}")
    private String client_key;

    @Value("${naver.secret}")
    private String client_secret;

    @Value("${publicData.key}")
    private String public_data_key;

    public NewResponseDto getNaverNews(String keyWord, int page) {
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
        NewResponseDto newsResponse = null;

        try {
            newsResponse = objectMapper.readValue(response, NewResponseDto.class);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return newsResponse;
    }

    public JobResponseDto getJobList(String ncsCdLst) {
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper objectMapper = new ObjectMapper();
        JobResponseDto jobResponseDto = new JobResponseDto();

        String url = "https://apis.data.go.kr/1051000/recruitment/list" +
                "?serviceKey=" + public_data_key +
                "&acbgCondLst=R7010" +
                "&ncsCdLst=" + ncsCdLst +
                "&numOfRows=5" +
                "&ongoingYn=Y" +
                "&pageNo=1" +
                "&pbancBgngYmd=2025-01-01" +
                "&recrutSe=R2030" +
                "&resultType=json";

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            jobResponseDto.setTotalCount(jsonNode.get("totalCount").asInt());

            List<JobsDetailDto> jobsDetailDtoList = objectMapper.readValue(
                    jsonNode.get("result").toString(), new TypeReference<List<JobsDetailDto>>() {}
            );
            jobResponseDto.setResult(jobsDetailDtoList);

            return jobResponseDto;
        } catch (HttpClientErrorException e) {
            System.out.println("HTTP 오류: " + e.getStatusCode());
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}