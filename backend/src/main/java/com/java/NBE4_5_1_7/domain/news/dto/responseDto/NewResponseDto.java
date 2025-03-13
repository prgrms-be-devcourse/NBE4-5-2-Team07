package com.java.NBE4_5_1_7.domain.news.dto.responseDto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.java.NBE4_5_1_7.domain.news.entity.NewsItem;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
public class NewResponseDto {
    @JsonProperty("lastBuildDate")
    private String lastBuildDate;
    @JsonProperty("total")
    private int total;
    @JsonProperty("start")
    private int start;
    @JsonProperty("display")
    private int display;
    @JsonProperty("items")
    private List<NewsItem> items;
}
