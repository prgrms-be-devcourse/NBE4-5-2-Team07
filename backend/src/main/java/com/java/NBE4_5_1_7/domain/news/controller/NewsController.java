package com.java.NBE4_5_1_7.domain.news.controller;

import com.java.NBE4_5_1_7.domain.news.dto.responseDto.JobResponseDto;
import com.java.NBE4_5_1_7.domain.news.dto.responseDto.JobsDetailDto;
import com.java.NBE4_5_1_7.domain.news.dto.responseDto.NewResponseDto;
import com.java.NBE4_5_1_7.domain.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<JobResponseDto> getJobs(
            @RequestParam String ncsCdLst,
            @RequestParam(defaultValue = "1") int page) {

        return ResponseEntity.ok(newsService.getJobList(ncsCdLst, page));
    }

    @GetMapping("/jobs/detail/{recrutPblntSn}")
    public ResponseEntity<JobsDetailDto> getJobsDetails(@PathVariable String recrutPblntSn) {
        return ResponseEntity.ok(newsService.getJobDetail(recrutPblntSn));
    }
}
