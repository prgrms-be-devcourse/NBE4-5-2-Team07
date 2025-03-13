package com.java.NBE4_5_1_7.domain.news.controller;

import com.java.NBE4_5_1_7.domain.news.dto.responseDto.NewResponseDto;
import com.java.NBE4_5_1_7.domain.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    @GetMapping
    public ResponseEntity<NewResponseDto> getNews(@RequestParam String keyWord, int display){
        return ResponseEntity.ok(newsService.getNaverNews(keyWord,display));
    }
}
