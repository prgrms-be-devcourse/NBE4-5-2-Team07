package com.java.NBE4_5_1_7.domain.news.controller;

import com.java.NBE4_5_1_7.domain.news.dto.responseDto.JobResponseDto;
import com.java.NBE4_5_1_7.domain.news.dto.responseDto.NewResponseDto;
import com.java.NBE4_5_1_7.domain.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    @GetMapping
    public ResponseEntity<NewResponseDto> getNews(
            @RequestParam String keyWord,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(newsService.getNaverNews(keyWord, page));
    }

    @GetMapping("/jobs")
    public ResponseEntity<JobResponseDto> getJobs(@RequestParam("ncsCdLst") String ncsCdLst) {
        return ResponseEntity.ok(newsService.getJobList(ncsCdLst));
    }
}
