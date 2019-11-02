-- create default database
CREATE DATABASE /*!32312 IF NOT EXISTS*/ `database` /*!40100 DEFAULT CHARACTER SET utf8 */;

use database;

CREATE TABLE IF NOT EXISTS favorite_type (
  type INT(5) PRIMARY KEY,
  name VARCHAR(18) NOT NULL,
  create_timestamp TIMESTAMP(6) NOT NULL DEFAULT current_timestamp(6),
  create_user_id VARCHAR(30) NOT NULL,
  update_timestamp TIMESTAMP(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  update_user_id VARCHAR(30) NOT NULL,
  KEY `type` (`type`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS favorite_primary (
  favorite_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  unique_id VARCHAR(18) NOT NULL,
  type INT(5) NOT NULL,
  code VARCHAR(18) NOT NULL,
  create_timestamp TIMESTAMP(6) NOT NULL DEFAULT current_timestamp(6),
  create_user_id VARCHAR(30) NOT NULL,
  update_timestamp TIMESTAMP(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  update_user_id VARCHAR(30) NOT NULL,
  KEY `unique_id` (`unique_id`),
  KEY `type` (`type`),
  KEY `code` (`code`),
  CONSTRAINT `favorite_primary_ibfk_1` FOREIGN KEY (`type`) REFERENCES `favorite_type` (`type`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS favorite_meta (
  meta_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  favorite_id BIGINT NOT NULL,
  unique_id VARCHAR(18) NOT NULL,
  type INT(5) NOT NULL,
  code VARCHAR(18) NOT NULL,
  create_timestamp TIMESTAMP(6) NOT NULL DEFAULT current_timestamp(6),
  create_user_id VARCHAR(30) NOT NULL,
  update_timestamp TIMESTAMP(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  update_user_id VARCHAR(30) NOT NULL,
  KEY `favorite_id` (`favorite_id`),
  KEY `unique_id` (`unique_id`),
  KEY `type` (`type`),
  KEY `code` (`code`),
  CONSTRAINT `favorite_meta_ibfk_1` FOREIGN KEY (`favorite_id`) REFERENCES `favorite_primary` (`favorite_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorite_meta_ibfk_2` FOREIGN KEY (`type`) REFERENCES `favorite_type` (`type`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
