package com.java.NBE4_5_1_7.domain.news.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class NewsItem {
    @JsonProperty("title")
    private String title;
    @JsonProperty("originallink")
    private String originallink;
    @JsonProperty("link")
    private String link;
    @JsonProperty("description")
    private String description;
    @JsonProperty("pubDate")
    private String pubDate;
}
