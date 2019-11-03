-- create default database
CREATE DATABASE /*!32312 IF NOT EXISTS*/ `database` /*!40100 DEFAULT CHARACTER SET utf8 */;

use database;

CREATE TABLE IF NOT EXISTS favorite_type (
  type_id INT(5) PRIMARY KEY,
  name VARCHAR(18) NOT NULL,
  create_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  create_user_id VARCHAR(30) NOT NULL DEFAULT 'admin',
  update_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  update_user_id VARCHAR(30) NOT NULL DEFAULT 'admin',
  KEY `type_id` (`type_id`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS favorite_primary (
  favorite_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  unique_id VARCHAR(18) NOT NULL,
  type_id INT(5) NOT NULL,
  code VARCHAR(18) NOT NULL,
  create_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  create_user_id VARCHAR(30) NOT NULL DEFAULT 'admin',
  update_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  update_user_id VARCHAR(30) NOT NULL DEFAULT 'admin',
  KEY `unique_id` (`unique_id`),
  KEY `type_id` (`type_id`),
  KEY `code` (`code`),
  CONSTRAINT `favorite_primary_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `favorite_type` (`type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS favorite_meta (
  meta_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  favorite_id BIGINT NOT NULL,
  unique_id VARCHAR(18) NOT NULL,
  type_id INT(5) NOT NULL,
  meta_code VARCHAR(18) NOT NULL,
  create_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  create_user_id VARCHAR(30) NOT NULL DEFAULT 'admin',
  update_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  update_user_id VARCHAR(30) NOT NULL DEFAULT 'admin',
  KEY `favorite_id` (`favorite_id`),
  KEY `unique_id` (`unique_id`),
  KEY `type_id` (`type_id`),
  KEY `meta_code` (`meta_code`),
  CONSTRAINT `favorite_meta_ibfk_1` FOREIGN KEY (`favorite_id`) REFERENCES `favorite_primary` (`favorite_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorite_meta_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `favorite_type` (`type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO favorite_type (`type_id`, name) VALUES(0, 'type1'),(10, 'type2'),(20, 'type3');
