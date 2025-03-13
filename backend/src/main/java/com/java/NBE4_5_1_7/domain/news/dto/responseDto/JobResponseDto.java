package com.java.NBE4_5_1_7.domain.news.dto.responseDto;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class JobResponseDto {
    private Long recrutPblntSn;
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
    private Integer recrutNope;
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
    private Integer decimalDay;
}
