package com.java.NBE4_5_1_7.domain.news.dto.responseDto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Data
@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobsDetailDto {
    private String recrutPblntSn;
    private String pblntInstCd;
    private String pbadmsStdInstCd;
    private String instNm;
    private String ncsCdLst;
    private String ncsCdNmLst;
    private String hireTypeLst;
    private String hireTypeNmLst;
    private String workRgnLst;
    private String workRgnNmLst;
    private String recrutSe;
    private String recrutSeNm;
    private String prefCondCn;
    private int recrutNope;
    private String pbancBgngYmd;
    private String pbancEndYmd;
    private String recrutPbancTtl;
    private String srcUrl;
    private String replmprYn;
    private String aplyQlfcCn;
    private String disqlfcRsn;
    private String scrnprcdrMthdExpln;
    private String prefCn;
    private String acbgCondLst;
    private String acbgCondNmLst;
    private String nonatchRsn;
    private String ongoingYn;
    private int decimalDay;
    private List<Files> files;
    private List<Steps> steps;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)  // 여기에도 추가
    public static class Files {
        private int recrutAtchFileNo;  // 필드 추가
        private int sortNo;
        private String atchFileNm;
        private String atchFileType;
        private String url;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)  // 여기에도 추가
    public static class Steps {
        private int recrutStepSn;
        private int recrutPblntSn;
        private String recrutPbancTtl;
        private String recrutNope;
        private String aplyNope;
        private String cmpttRt;
        private String rsnOcrnYmd;
        private int sortNo;
        private int minStepSn;
        private int maxStepSn;
    }
}

